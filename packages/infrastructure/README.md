# Infrastructure

CodeChart's infrastructure is completely automated using Pulumi. The infrastructure is defined in TypeScript and is deployed to Linode.

## Overview

The infrastructure consists of the following general components:
- Linode: The cloud provider
    - An LKE (Linode Kubernetes Engine) cluster
- Kubernetes: The container orchestrator
    - Various Kubernetes resources that are deployed to the cluster, served on `codechart.com`

## Usage

You must have a pulumi token or account to deploy the infrastructure. If you have an account, you can login with `pulumi login`. If you have a token you can set it by setting the `PULUMI_ACCESS_TOKEN` environment variable.

To preview the changes that will be made, run `pulumi preview`. To deploy the changes, run `pulumi up`. It is not recommended to run `pulumi up`. Let the CI/CD pipeline handle the deployment.