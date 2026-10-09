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
                bat 'docker build -t %ECR_REGISTRY%/%BACKEND_IMAGE%:%BUILD_NUMBER% -f backend\\Dockerfile backend'
                bat 'docker build -t %ECR_REGISTRY%/%FRONTEND_IMAGE%:%BUILD_NUMBER% -f frontend\\Dockerfile frontend'
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
                    bat 'aws ecr get-login-password --region %AWS_DEFAULT_REGION% | docker login --username AWS --password-stdin %ECR_REGISTRY%'
                    bat 'docker push %ECR_REGISTRY%/%BACKEND_IMAGE%:%BUILD_NUMBER%'
                    bat 'docker push %ECR_REGISTRY%/%FRONTEND_IMAGE%:%BUILD_NUMBER%'
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