# Railway Migration Plan - Simplified Architecture

## Overview
Migrate from Linode K8S to Railway with minimal cloud infrastructure: only 2 services (landing-page + license-api) while maintaining full download functionality through GitHub Releases.

## Target Architecture

### Cloud Services (Railway)
- **landing-page** - Marketing website serving download links
- **license-api** - License validation service + PostgreSQL database

### Downloads (GitHub Releases CDN)
- **codechart executables** - Windows/Mac/Linux desktop apps
- **IDE plugins** - VS Code + IntelliJ extensions
- **docs** - Documentation (if needed)

### User Experience
1. Visit use-covalent.com → download codechart executable
2. Run codechart locally on user's machine
3. Codechart validates license via Railway license-api
4. Install IDE plugins from download links

---

## Migration Steps

### STEP 1: GitHub Actions Enhancement

#### Current State
- `docker.yml` builds 4 images, pushes to GHCR
- `pulumi.yml` deploys to Linode K8S

#### Changes Needed

**1. Modify `.github/workflows/docker.yml`**
- Keep existing 4-image build process
- Add artifact extraction and GitHub Release upload
- Add Railway deployment for 2 services only
- Remove dependency on pulumi.yml

**2. Add Artifact Upload Job**
```yaml
  upload-artifacts:
    needs: build-or-delete-images
    runs-on: ubuntu-latest
    steps:
      - name: Create Release
        uses: actions/create-release@v1
        with:
          tag_name: build-${{ github.sha }}
          
      - name: Extract and Upload Artifacts
        run: |
          # Extract codechart executables from codechart image
          docker create --name temp ghcr.io/codechart/codechart:${{ github.sha }}
          docker cp temp:/usr/src/app/dist-runnables ./executables
          
          # Extract IDE plugins from respective images
          # Upload all to GitHub Release
```

**3. Add Railway Deployment Job**
```yaml
  deploy-to-railway:
    needs: [build-or-delete-images, upload-artifacts]
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          railway up --service landing-page --detach
          railway up --service license-api --detach
```

#### Validation
- ✅ All artifacts uploaded to GitHub Releases
- ✅ Both Railway services deployed with latest images
- ✅ Downloads accessible via GitHub CDN

---

### STEP 2: Railway Project Setup

#### Actions Needed

**1. Create Railway Account & Project**
- Sign up at railway.app with GitHub account
- Create new project: "codechart-production"

**2. Configure Landing Page Service**
- Service name: `landing-page`
- Source: Docker image from GHCR
- Image: `ghcr.io/codechart/landing-page:latest`
- Environment variables:
  ```env
  NODE_ENV=production
  PORT=80
  GITHUB_REPO=codechart/codechart
  ```

**3. Configure License API Service**
- Service name: `license-api`  
- Source: Docker image from GHCR
- Image: `ghcr.io/codechart/license-api:latest`
- Environment variables:
  ```env
  NODE_ENV=production
  PORT=3000
  DATABASE_URL=${{postgresql.DATABASE_URL}}
  ```

**4. Add PostgreSQL Database**
- Service type: PostgreSQL database
- Plan: Starter (sufficient for audit logging)
- Auto-connect to license-api service

#### Validation
- ✅ 2 services + 1 database visible in Railway dashboard
- ✅ Services pull from GHCR successfully
- ✅ Database connection established

---

### STEP 3: Update Landing Page

#### Code Changes Needed

**File: `packages/landing-page/src/components/DownloadSection.tsx` (or similar)**
```typescript
// Replace local download links with GitHub Release URLs
const GITHUB_REPO = process.env.GITHUB_REPO || 'codechart/codechart'
const DOWNLOAD_BASE = `https://github.com/${GITHUB_REPO}/releases/latest/download`

const downloadLinks = {
  windows: `${DOWNLOAD_BASE}/covalent-win.zip`,
  mac: `${DOWNLOAD_BASE}/covalent-mac.tar.gz`,
  linux: `${DOWNLOAD_BASE}/covalent-linux.tar.gz`,
  vscode: `${DOWNLOAD_BASE}/covalent-vscode-plugin-1.0.0.vsix`,
  intellij: `${DOWNLOAD_BASE}/Covalent-IJ-Plugin.zip`
}
```

**File: `Dockerfile` - Update landing-page stage**
```dockerfile
FROM nginx AS landing-page
COPY --from=landing-page-builder /usr/src/build/dist /usr/share/nginx/html
# Remove these artifact copying lines:
# COPY --from=downloads-packager /usr/src/app/download /usr/share/nginx/html/download
# COPY --from=intellij-plugin /usr/src/app/build/distributions/Covalent-IJ-Plugin.zip /usr/share/nginx/html/download/
# COPY --from=vscode-plugin /usr/src/app/covalent-vscode-plugin-1.0.0.vsix /usr/share/nginx/html/download/
```

#### Validation
- ✅ Landing page shows download buttons
- ✅ Download links point to GitHub Releases
- ✅ All downloads work correctly

---

### STEP 4: License API Migration

#### Database Migration
- **Current**: PostgreSQL running in K8S
- **Target**: Railway managed PostgreSQL
- **Data**: Audit logs (can start fresh or migrate)

#### Code Changes
**File: `packages/license-api/` (Go database config)**
```go
// Update database connection to use Railway's DATABASE_URL
databaseURL := os.Getenv("DATABASE_URL")
if databaseURL == "" {
    databaseURL = "postgres://localhost:5432/postgres"
}
```

#### Validation
- ✅ License API connects to Railway PostgreSQL
- ✅ Audit logging works correctly
- ✅ API accessible from locally-running codechart instances

---

### STEP 5: Domain Setup

#### Custom Domains in Railway
1. **Landing Page Service**
   - Add domain: `use-covalent.com`
   - Add domain: `www.use-covalent.com`

2. **License API Service**
   - Add domain: `api.use-covalent.com`

#### DNS Updates (Namecheap)
```
A     use-covalent.com        → [Railway IP for landing-page]
CNAME www.use-covalent.com    → use-covalent.com
CNAME api.use-covalent.com    → [Railway domain for license-api]
```

#### Validation
- ✅ `use-covalent.com` loads landing page
- ✅ `api.use-covalent.com` responds to license API calls
- ✅ SSL certificates automatically provisioned

---

### STEP 6: Testing & Validation

#### Download Testing
- ✅ Download codechart executables from GitHub Releases
- ✅ Install and run codechart locally
- ✅ Verify license validation calls Railway API
- ✅ Download and install IDE plugins

#### Service Testing
- ✅ Landing page loads and displays correctly
- ✅ All download links functional
- ✅ License API responds to validation requests
- ✅ Database audit logging works

#### Performance Testing
- ✅ Compare response times vs current Linode setup
- ✅ Test GitHub Release download speeds
- ✅ Verify Railway service reliability

---

### STEP 7: Infrastructure Cleanup

#### Remove Pulumi Infrastructure
1. **Delete Linode Resources**
   ```bash
   cd packages/infrastructure
   pulumi destroy --stack dev
   ```

2. **Remove Infrastructure Code**
   - Delete `packages/infrastructure/` directory
   - Delete `.github/workflows/pulumi.yml`
   - Update README to remove Pulumi references

3. **Cancel Linode Services**
   - Remove LKE cluster charges
   - Keep Linode account if desired

#### Validation
- ✅ Railway handling all traffic successfully
- ✅ No Linode charges on next bill
- ✅ Old infrastructure completely removed

---

## Architecture Benefits

### Simplified Infrastructure
- **Before**: Full K8S cluster (4 pods + database + ingress + certificates)
- **After**: 2 Railway services + managed database

### Cost Comparison
- **Linode**: ~$20/month (LKE + load balancer)
- **Railway**: ~$15/month (2 services + PostgreSQL)

### Maintenance Reduction
- No Kubernetes management
- No certificate renewals
- No infrastructure scaling decisions
- No Pulumi state management

### Improved User Experience
- **Faster downloads** via GitHub's global CDN
- **Always available executables** (independent of service uptime)
- **Simpler installation** (direct executable downloads)

---

## Migration Timeline

- **Day 1**: GitHub Actions enhancement (2-3 hours)
- **Day 2**: Railway setup and testing (2-3 hours)
- **Day 3**: Code changes and validation (2-3 hours)
- **Day 4**: DNS cutover and monitoring (1-2 hours)
- **Day 5**: Cleanup old infrastructure (1 hour)

**Total: 8-12 hours spread over 1 week**

---

## Rollback Plan

### Quick Rollback (DNS-based)
1. Change DNS records back to Linode IPs
2. Linode infrastructure remains running during migration
3. 5-30 minute DNS propagation time

### Full Rollback
1. Re-enable `.github/workflows/pulumi.yml`
2. Revert any code changes via git
3. Downloads continue working from GitHub Releases

---

## Success Criteria

✅ **Landing page** serves from Railway with GitHub download links  
✅ **License API** validates licenses from Railway PostgreSQL  
✅ **Desktop executables** downloadable from GitHub Releases  
✅ **IDE plugins** downloadable and installable  
✅ **Users can run codechart locally** with cloud license validation  
✅ **Performance equal or better** than current setup  
✅ **Monthly costs reduced** by ~25%  
✅ **Infrastructure complexity eliminated**  
✅ **Deployment happens automatically** on git push  

This plan dramatically simplifies the infrastructure while maintaining all user-facing functionality and improving download reliability through GitHub's CDN.