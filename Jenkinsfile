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
            description: 'Push the built images to Amazon ECR. Enable only after Jenkins AWS credentials are configured.'
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
    }

    post {
        success {
            echo 'Nexora-Tech pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Review the stage logs before retrying.'
        }
        always {
            echo 'Kubernetes deployment is not enabled in this pipeline yet.'
        }
    }
}
