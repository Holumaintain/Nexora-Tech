pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }

    parameters {
        booleanParam(
            name: 'PUSH_TO_ECR',
            defaultValue: false,
            description: 'Push the built images to Amazon ECR. Enable only after the Jenkins AWS credentials are configured.'
        )

        booleanParam(
            name: 'DEPLOY_TO_MINIKUBE',
            defaultValue: false,
            description: 'Deploy the successfully pushed ECR images to the Nexora namespace on Minikube.'
        )
    }

    environment {
        AWS_DEFAULT_REGION = 'eu-west-1'
        ECR_REGISTRY = '148598146690.dkr.ecr.eu-west-1.amazonaws.com'
        BACKEND_IMAGE = 'nexora-backend'
        FRONTEND_IMAGE = 'nexora-frontend'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                bat 'git --version'
                bat 'docker --version'
            }
        }

        stage('Validate Backend') {
            steps {
                dir('backend') {
                    bat 'npm ci'
                    bat 'npm run typecheck'
                    bat 'npm run build'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                bat 'docker build -t %ECR_REGISTRY%/%BACKEND_IMAGE%:ci-%BUILD_NUMBER% -f backend\\Dockerfile backend'
                bat 'docker build -t %ECR_REGISTRY%/%FRONTEND_IMAGE%:ci-%BUILD_NUMBER% -f frontend\\Dockerfile frontend'
            }
        }

        stage('Push Images to Amazon ECR') {
            when {
                expression { params.PUSH_TO_ECR }
            }
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'aws-ecr-credentials',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {
                    bat 'aws sts get-caller-identity --query Account --output text'
                    powershell '''
                        $ErrorActionPreference = 'Stop'
                        $tag = "ci-$env:BUILD_NUMBER"

                        foreach ($repository in @($env:BACKEND_IMAGE, $env:FRONTEND_IMAGE)) {
                            $existingTag = aws ecr list-images `
                                --region $env:AWS_DEFAULT_REGION `
                                --repository-name $repository `
                                --filter tagStatus=TAGGED `
                                --query "imageIds[?imageTag=='$tag'].imageTag" `
                                --output text

                            if ($LASTEXITCODE -ne 0) {
                                throw "Unable to check ECR tags for $repository."
                            }

                            if (-not [string]::IsNullOrWhiteSpace($existingTag) -and $existingTag -ne 'None') {
                                throw "Tag $tag already exists in $repository. Refusing to overwrite it."
                            }
                        }

                        Write-Host "Tag $tag is unused in both ECR repositories."
                    '''
                    bat 'aws ecr get-login-password --region %AWS_DEFAULT_REGION% | docker login --username AWS --password-stdin %ECR_REGISTRY%'
                    bat 'docker push %ECR_REGISTRY%/%BACKEND_IMAGE%:ci-%BUILD_NUMBER%'
                    bat 'docker push %ECR_REGISTRY%/%FRONTEND_IMAGE%:ci-%BUILD_NUMBER%'
                }
            }
            post {
                always {
                    bat 'docker logout %ECR_REGISTRY%'
                }
            }
        }
        stage('Deploy to Minikube') {
            when {
                allOf {
                    expression { params.PUSH_TO_ECR }
                    expression { params.DEPLOY_TO_MINIKUBE }
                }
            }
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'aws-ecr-credentials',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {
                    powershell '''
                        $ErrorActionPreference = 'Stop'

                        $context = (& kubectl config current-context).Trim()
                        if ($LASTEXITCODE -ne 0 -or $context -ne 'minikube') {
                            throw "Expected Minikube context. Actual context: $context"
                        }

                        foreach ($deployment in @('nexora-backend', 'nexora-frontend')) {
                            $permission = (& kubectl auth can-i patch deployment/$deployment -n nexora).Trim()
                            if ($LASTEXITCODE -ne 0 -or $permission -ne 'yes') {
                                throw "Jenkins cannot patch $deployment in namespace nexora."
                            }
                        }

                        $tag = "ci-$env:BUILD_NUMBER"
                        $token = (& aws ecr get-login-password --region $env:AWS_DEFAULT_REGION)
                        if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($token)) {
                            throw "Could not obtain an ECR authentication token."
                        }

                        $auth = [Convert]::ToBase64String(
                            [Text.Encoding]::UTF8.GetBytes("AWS:$token")
                        )

                        $dockerConfig = @{
                            auths = @{
                                $env:ECR_REGISTRY = @{
                                    username = 'AWS'
                                    password = $token
                                    auth = $auth
                                }
                            }
                        } | ConvertTo-Json -Depth 5

                        $tempFile = Join-Path $env:TEMP (
                            'nexora-ecr-' + [guid]::NewGuid().ToString('N') + '.json'
                        )

                        try {
                            [IO.File]::WriteAllText(
                                $tempFile,
                                $dockerConfig,
                                [Text.UTF8Encoding]::new($false)
                            )

                            $secretYaml = & kubectl create secret generic ecr-registry-secret `
                                --namespace nexora `
                                --type=kubernetes.io/dockerconfigjson `
                                "--from-file=.dockerconfigjson=$tempFile" `
                                --dry-run=client -o yaml

                            if ($LASTEXITCODE -ne 0) {
                                throw "Failed to prepare the ECR pull secret."
                            }

                            $secretYaml | & kubectl apply -f -
                            if ($LASTEXITCODE -ne 0) {
                                throw "Failed to refresh the ECR pull secret."
                            }
                        }
                        finally {
                            Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
                            $token = $null
                            $auth = $null
                            $dockerConfig = $null
                        }

                        & kubectl set image deployment/nexora-backend `
                            "backend=$env:ECR_REGISTRY/$env:BACKEND_IMAGE`:$tag" -n nexora
                        if ($LASTEXITCODE -ne 0) {
                            throw "Failed to update the backend image."
                        }

                        & kubectl set image deployment/nexora-frontend `
                            "frontend=$env:ECR_REGISTRY/$env:FRONTEND_IMAGE`:$tag" -n nexora
                        if ($LASTEXITCODE -ne 0) {
                            throw "Failed to update the frontend image."
                        }

                        & kubectl rollout status deployment/nexora-backend -n nexora --timeout=600s
                        if ($LASTEXITCODE -ne 0) {
                            throw "Backend rollout did not complete successfully."
                        }

                        & kubectl rollout status deployment/nexora-frontend -n nexora --timeout=600s
                        if ($LASTEXITCODE -ne 0) {
                            throw "Frontend rollout did not complete successfully."
                        }

                        & kubectl get deployments -n nexora -o wide
                        if ($LASTEXITCODE -ne 0) {
                            throw "Could not verify the final deployment status."
                        }

                        Write-Host "Both Nexora deployments completed successfully."
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Nexora-Tech pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Review the stage logs before retrying.'
        }
        always {
            echo 'Review the Deploy to Minikube stage above for the deployment result.'
        }
    }
}
