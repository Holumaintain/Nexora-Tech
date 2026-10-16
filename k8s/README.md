# Nexora-Tech Kubernetes deployment

These manifests target the existing Nexora-Tech ECR images in eu-west-1.
They do not create an EKS cluster, load balancer, or other AWS infrastructure.

## Prerequisites

- A running Kubernetes cluster and a working `kubectl` context.
- Access to the private ECR repositories.
- A locally-created Kubernetes Secret named `nexora-backend-secrets`.
- The `ecr-registry-secret` pull secret if the cluster cannot pull the images anonymously.

## 1. Confirm the cluster

    kubectl config current-context
    kubectl get nodes

Do not apply the manifests until the intended cluster is confirmed.

## 2. Create the namespace and configuration

    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/backend-configmap.yaml

## 3. Configure private ECR image pulls

The ECR registry is:

    148598146690.dkr.ecr.eu-west-1.amazonaws.com

The Kubernetes namespace needs a Docker registry Secret named `ecr-registry-secret`.
ECR authorization tokens expire, so this secret must be refreshed periodically.
Do not commit credentials or tokens to Git.

## 4. Configure backend secrets

Create `k8s/backend.env` locally using the exact environment variable names required
by `backend/src/config/env.ts`. It must contain the production `MONGODB_URI`,
a strong `JWT_SECRET` of at least 32 characters, and any required SMTP credentials.
Never commit this file. Do not use the development database or placeholder values.

Create/update the Kubernetes Secret:

    kubectl create secret generic nexora-backend-secrets `
      --namespace nexora `
      --from-env-file=k8s/backend.env `
      --dry-run=client -o yaml | kubectl apply -f -

The file `k8s/backend.env` is excluded by this directory's `.gitignore`.

## 5. Deploy the application

    kubectl apply -f k8s/backend-service.yaml
    kubectl apply -f k8s/frontend-nginx-configmap.yaml
    kubectl apply -f k8s/frontend-service.yaml
    kubectl apply -f k8s/backend-deployment.yaml
    kubectl apply -f k8s/frontend-deployment.yaml

## 6. Verify and access locally

    kubectl get pods,services -n nexora
    kubectl rollout status deployment/nexora-backend -n nexora
    kubectl rollout status deployment/nexora-frontend -n nexora

Open a separate terminal and run:

    kubectl port-forward -n nexora service/nexora-frontend 8080:80

Then browse to http://localhost:8080.

## Notes

- The image tags currently target the CI build `ci-6`; update them when a newer
  verified build is available.
- `CLIENT_URL` is set to `http://localhost:8080` for local port-forward testing.
  Change it to the actual browser origin if your access method differs.
- This setup uses ClusterIP services and port-forwarding to avoid creating a
  billable public load balancer.
- These manifests have not yet been applied or validated against a live cluster.
