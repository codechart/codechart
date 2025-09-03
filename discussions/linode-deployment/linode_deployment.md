# CodeChart Linode Deployment Architecture

## System Overview
CodeChart deployed on Linode Kubernetes Engine (LKE) with automated CI/CD via GitHub Actions and Pulumi infrastructure management.

**Components:**
- **codechart** - Node.js API + Angular UI
- **license-api** - Go microservice + PostgreSQL (containerized)
- **landing-page** - React site (use-covalent.com)
- **docs** - MkDocs documentation
- **IDE plugins** - VS Code & IntelliJ extensions

## Platform Roles
- **GitHub**: Source code, CI/CD workflows, Docker image registry (GHCR)
- **Linode**: Managed K8S cluster (LKE), DNS for use-covalent.com
- **Namecheap**: Domain registrar
- **Pulumi**: Infrastructure-as-Code (CLI + Cloud dashboard)

## Deployment Flow
1. **Code Push** → GitHub Actions triggers docker.yml
2. **Build** → GitHub runners build 4 Docker images, push to GHCR
3. **Deploy** → Pulumi CLI calls Linode API to update K8S cluster
4. **Run** → K8S pulls images from GHCR, restarts containers

**Key Insight:** Building (GitHub) and hosting (Linode) are separate - connected via GHCR registry.

## Additional Technical Questions & Answers

### Q1: How does the same SHA image name get pushed and pulled? How do we get the same SHA?

**Answer:** The SHA synchronization happens through Git, not Docker.

**Docker Build (GitHub Actions):**
```yaml
# In .github/workflows/docker.yml
- name: Extract metadata for Docker  
  uses: docker/metadata-action@v4
  with:
    tags: |
      type=sha,enable={{is_default_branch}}  # Creates tag like "abc1234"
```

**Pulumi Deployment (GitHub Actions):**
```typescript
// In packages/infrastructure/kubernetes/utils.ts
export const getImageTag = () => {
  const shortSha = execSync("git rev-parse --short HEAD").toString().trim();
  return shortSha;  // Returns same "abc1234"
}
```

**Key Point:** Both workflows run on the same Git commit, so `git rev-parse --short HEAD` returns the identical SHA in both steps. The Docker build tags the image with this SHA, and Pulumi deployment pulls the image using the same SHA.

### Q2: The Linode K8S cluster that gets commands from GitHub Actions - did we deploy it? Is it just always there? How does it identify it's me?

**Answer:** Yes, YOU deployed the K8S cluster via Pulumi, and it authenticates via stored credentials.

**Cluster Creation:**
```typescript
// In packages/infrastructure/linode.ts
const lkeCluster = new linode.LkeCluster("codechart", {
  k8sVersion: "1.31",
  label: "codechart",
  pools: [{ count: 1, type: "g6-standard-1" }],
  region: "eu-central",
});
```

**Authentication Chain:**
1. **Linode API Token:** Stored in GitHub Secrets, allows Pulumi to create/manage Linode resources
2. **Kubeconfig:** Generated when cluster is created, contains cluster URL + certificates
3. **GitHub Actions:** Uses the kubeconfig to authenticate with your specific K8S cluster

**How it identifies you:**
- Linode API calls use your Linode account token
- Kubeconfig contains cluster-specific certificates and endpoint URL
- Only your GitHub repository has access to these secrets

**Persistence:** The cluster stays running 24/7 on Linode until you explicitly destroy it. Each deployment updates the existing cluster rather than creating a new one.

**Security:** Your cluster is isolated to your Linode account and only accessible via the kubeconfig credentials stored in your GitHub repository secrets.

### Q3: So the Linode machine comes with K8S pre-installed, so we can use it to setup a cluster?

**Answer:** No, you're not using a regular Linode machine. You're using **Linode Kubernetes Engine (LKE)** - a managed Kubernetes service.

**What actually happens:**
- You don't get a "machine with K8S pre-installed"
- Instead, Linode provides **LKE** (Linode Kubernetes Engine) - their managed K8S service
- When Pulumi runs `new linode.LkeCluster()`, it tells Linode's API: "create a managed K8S cluster for me"
- Linode then provisions and manages the entire K8S infrastructure behind the scenes

**LKE vs Regular Linode:**
- **Regular Linode:** You get a virtual machine, install whatever you want
- **LKE (what you use):** Linode provides a fully managed K8S cluster as a service

**What Linode manages for you in LKE:**
- K8S control plane (API server, etcd, scheduler, etc.)
- Worker nodes (your g6-standard-1 machine)
- K8S networking and load balancing
- Cluster upgrades and maintenance
- Node scaling and replacement

**What you manage:**
- Your application containers
- K8S manifests (deployments, services, ingresses)
- Application-level configurations

So you're not "setting up K8S on a machine" - you're using Linode's managed K8S service where they handle all the K8S infrastructure complexity for you.