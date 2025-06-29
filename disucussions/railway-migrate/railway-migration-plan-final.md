# Railway Migration Plan - Final (GitHub Releases + Railway Native)

## Overview
Migrate from Linode K8S to Railway PaaS using Railway's native GitHub integration + GitHub Releases for desktop app distribution. No Pulumi, no Kubernetes - Railway managed platform + GitHub CDN for downloads.

**Key Architecture Changes:**
- **codechart** → Railway service (web version for IDE plugin communication)
- **license-api** → Railway service + PostgreSQL (audit logging)
- **landing-page** → Railway service (marketing site with GitHub download links)
- **Desktop apps** → GitHub Releases (direct download links)

---

## STEP 1: GitHub Actions for Desktop App Releases

### Actions Needed:

1. **Create Release Workflow File**
   - Create `.github/workflows/build-artifacts.yml`
   
2. **Workflow Configuration:**
```yaml
name: Build Release Artifacts
on:
  push:
    tags: ['v*']  # Trigger on version tags like v1.2.3
  workflow_dispatch:  # Allow manual triggers

jobs:
  build-desktop-apps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Build codechart desktop executables
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Build UI
        run: |
          cd packages/ui
          npm install
          npm run build --base-href .
          
      - name: Build API + integrate UI
        run: |
          cd packages/api
          npm install
          npm run build
          cp -r ../ui/dist/* ./public/
          
      - name: Create executables
        run: |
          cd packages/api
          npx pkg . --targets linux,macos,win --out-path dist-runnables
          
      # Build VS Code plugin
      - name: Build VS Code extension
        run: |
          cd packages/vscode-plugin
          npm install
          npm run package
          npx vsce package
          
      # Build IntelliJ plugin
      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          
      - name: Build IntelliJ plugin
        run: |
          cd packages/intellij-plugin
          ./gradlew buildPlugin
          
      # Package downloads
      - name: Package downloads
        run: |
          mkdir -p download
          cd packages/api
          
          # Package Linux
          mkdir out-linux
          cp dist-runnables/covalent-linux out-linux/
          cp -r config out-linux/
          cp pkg-readme.md out-linux/readme.md
          tar -czvf ../../download/covalent-linux.tar.gz -C out-linux .
          
          # Package Mac
          mkdir out-macos  
          cp dist-runnables/covalent-macos out-macos/
          cp -r config out-macos/
          cp pkg-readme.md out-macos/readme.md
          tar -czvf ../../download/covalent-mac.tar.gz -C out-macos .
          
          # Package Windows
          mkdir out-win
          cp dist-runnables/covalent-win.exe out-win/
          cp -r config out-win/
          cp pkg-readme.md out-win/readme.md
          cd out-win && zip -r ../../../download/covalent-win.zip . && cd ..
          
      # Create GitHub Release
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            download/covalent-linux.tar.gz
            download/covalent-mac.tar.gz
            download/covalent-win.zip
            packages/vscode-plugin/covalent-vscode-plugin-1.0.0.vsix
            packages/intellij-plugin/build/distributions/Covalent-IJ-Plugin.zip
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Validation:
- ✅ Create a test git tag: `git tag v1.0.0-test && git push origin v1.0.0-test`
- ✅ Check GitHub Actions runs successfully
- ✅ Verify GitHub Release is created with all 5 files
- ✅ Test download links work

**How to Check:**
- GitHub repository → Actions tab → should see successful workflow
- GitHub repository → Releases tab → should see new release with download files
- Test download URLs: `https://github.com/YOUR_USERNAME/codechart/releases/latest/download/covalent-linux.tar.gz`

---

## STEP 2: Railway Account Setup

### Actions Needed:
1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with your GitHub account (use same account that owns codechart repo)
   - Verify email if prompted

2. **Install Railway CLI** (optional but helpful for debugging):
   ```bash
   npm install -g @railway/cli
   railway login
   ```

### Validation:
- ✅ Can access railway.app dashboard
- ✅ CLI command `railway whoami` shows your username

---

## STEP 3: Create Railway Project & Services

### Actions Needed:

1. **Create New Project**
   - Railway Dashboard → "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your `codechart` repository
   - Project name: `codechart-production`

2. **Configure First Service (codechart web app)**
   - Railway will auto-detect Dockerfile
   - Service name: `codechart`
   - Build settings:
     - **Build Command**: Leave empty (uses Dockerfile)
     - **Dockerfile Path**: `Dockerfile`
     - **Docker Build Target**: `codechart`
   - Click "Deploy"

3. **Add Second Service (license-api)**
   - In same project → "New Service"
   - Choose "GitHub Repo" → select same codechart repo
   - Service name: `license-api`
   - Build settings:
     - **Dockerfile Path**: `Dockerfile`
     - **Docker Build Target**: `license-api`
   - Click "Deploy"

4. **Add Third Service (landing-page)**
   - Repeat same process
   - Service name: `landing-page`
   - **Docker Build Target**: `landing-page`

5. **Add Database Service**
   - In same project → "New Service"
   - Choose "Database" → "PostgreSQL"
   - Database name: `license-audit-db`
   - Plan: Starter (sufficient for audit logging)

### Validation:
- ✅ 4 services visible in Railway dashboard (3 apps + 1 database)
- ✅ All 3 app services show "Building" or "Success" status
- ✅ Database shows "Running" status
- ✅ Each service has a `.railway.app` URL assigned

**How to Check:**
- Railway Dashboard shows all services
- Click each service → "Deployments" tab → should see successful builds
- Click database service → "Connect" tab → should see connection string

---

## STEP 4: Environment Variables Configuration

### Actions Needed:

For each service, go to Railway Dashboard → Service → "Variables" tab:

#### codechart service:
```env
NODE_ENV=production
PORT=2900
LICENSE_API_URL=https://${{license-api.RAILWAY_PUBLIC_DOMAIN}}
```

#### license-api service:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=${{license-audit-db.DATABASE_URL}}
```

#### landing-page service:
```env
NODE_ENV=production
PORT=80
GITHUB_REPO=YOUR_USERNAME/codechart
```

**Note:** Replace `YOUR_USERNAME` with your actual GitHub username.

### Validation:
- ✅ All services redeploy automatically after adding variables
- ✅ license-api connects to PostgreSQL database
- ✅ codechart can communicate with license-api
- ✅ landing-page builds successfully

**How to Check:**
- Railway Dashboard → each service → "Logs" tab
- Look for successful database connections in license-api logs
- Look for successful startup messages in codechart logs
- Test service endpoints (use Railway-provided URLs)

---

## STEP 5: Code Changes Required

### Changes Needed:

#### File: `packages/license-api/` (Go database configuration)
```go
// BEFORE (K8S style environment variables)
host := os.Getenv("DB_HOST")
port := os.Getenv("DB_PORT") 
user := os.Getenv("DB_USER")
password := os.Getenv("DB_PASSWORD")
dbname := os.Getenv("DB_NAME")

// AFTER (Railway style - single connection URL)
databaseURL := os.Getenv("DATABASE_URL")
if databaseURL == "" {
    databaseURL = "postgres://localhost:5432/postgres"
}
```

#### File: `packages/api/src/` (License API communication - if it exists)
```typescript
// BEFORE (K8S internal DNS)
const LICENSE_API_BASE = 'http://license-api:3000'

// AFTER (Railway environment variable)
const LICENSE_API_BASE = process.env.LICENSE_API_URL || 'http://localhost:3000'
```

#### File: `packages/landing-page/src/` (GitHub download links)
```typescript
// Add GitHub release download URLs
const GITHUB_REPO = process.env.GITHUB_REPO || 'codechart/codechart'
const DOWNLOAD_BASE = `https://github.com/${GITHUB_REPO}/releases/latest/download`

const downloadLinks = {
  linux: `${DOWNLOAD_BASE}/covalent-linux.tar.gz`,
  mac: `${DOWNLOAD_BASE}/covalent-mac.tar.gz`, 
  windows: `${DOWNLOAD_BASE}/covalent-win.zip`,
  vscode: `${DOWNLOAD_BASE}/covalent-vscode-plugin-1.0.0.vsix`,
  intellij: `${DOWNLOAD_BASE}/Covalent-IJ-Plugin.zip`
}
```

### Actions Needed:
1. Make the above code changes
2. Commit and push to main branch
3. Railway auto-deploys the changes

### Validation:
- ✅ Services restart successfully after code changes
- ✅ license-api connects to PostgreSQL with DATABASE_URL
- ✅ codechart can communicate with license-api via HTTPS
- ✅ landing-page download links point to GitHub Releases

---

## STEP 6: Update Landing Page Dockerfile

### Current Issue:
Landing page Dockerfile tries to copy artifacts from other build stages, which won't work in Railway.

### Actions Needed:

#### File: `Dockerfile` (update landing-page stage)
```dockerfile
FROM node AS landing-page-builder
WORKDIR /usr/src/build
COPY packages/landing-page/package*.json ./
RUN npm install
COPY packages/landing-page .
RUN npm run build

FROM nginx AS landing-page
COPY --from=landing-page-builder /usr/src/build/dist /usr/share/nginx/html
# Remove these lines - no longer needed:
# COPY --from=downloads-packager /usr/src/app/download /usr/share/nginx/html/download
# COPY --from=intellij-plugin /usr/src/app/build/distributions/Covalent-IJ-Plugin.zip /usr/share/nginx/html/download/
# COPY --from=vscode-plugin /usr/src/app/covalent-vscode-plugin-1.0.0.vsix /usr/share/nginx/html/download/
```

### Validation:
- ✅ landing-page service builds successfully without artifact dependencies
- ✅ Download links point to GitHub Releases instead of local files

---

## STEP 7: Custom Domain Setup

### Actions Needed:

1. **Add Custom Domains in Railway**
   - codechart service → "Settings" → "Domains"
   - Add domain: `use-covalent.com`
   - Add domain: `www.use-covalent.com`
   
   - license-api service → "Settings" → "Domains"
   - Add domain: `api.use-covalent.com`

2. **Update DNS Records** (at Namecheap):
   ```
   A     use-covalent.com        → [Railway IP shown in dashboard]
   CNAME www.use-covalent.com    → use-covalent.com
   CNAME api.use-covalent.com    → [Railway domain for license-api]
   ```

   **Note:** Railway shows exact DNS records needed in dashboard after adding domains.

### Validation:
- ✅ `use-covalent.com` loads landing page with GitHub download links
- ✅ `api.use-covalent.com` responds to license API calls
- ✅ SSL certificates are automatically provisioned

**How to Check:**
```bash
curl -I https://use-covalent.com        # Should return 200 OK
curl -I https://api.use-covalent.com    # Should return 200 OK
```

---

## STEP 8: Final Testing & Cutover

### Testing Actions:

1. **Desktop App Downloads**
   - Test all GitHub Release download links from landing page
   - Download and run Linux/Mac/Windows executables
   - Install and test VS Code + IntelliJ plugins

2. **Web Application Testing**
   - Test IDE plugins → Railway codechart backend communication
   - Test license validation: codechart → license-api
   - Test audit logging: license-api → PostgreSQL

3. **Performance Testing**
   - Compare response times vs current Linode deployment
   - Test GitHub Release download speeds vs current setup

### Validation Checklist:
- ✅ Landing page serves download links correctly
- ✅ All desktop app downloads work from GitHub Releases
- ✅ IDE plugins connect to Railway codechart service
- ✅ License validation works: codechart ↔ license-api
- ✅ Audit data is saved to PostgreSQL database
- ✅ Performance is acceptable
- ✅ SSL certificates working on all domains

**How to Check:**
- Download and test each desktop app package
- Install VS Code plugin and test connection to Railway
- Install IntelliJ plugin and test connection to Railway
- Check Railway Dashboard → "Metrics" for performance data
- Check license-api logs for successful database operations

---

## STEP 9: GitHub Actions Cleanup

### Actions Needed:

1. **Remove Pulumi Workflow**
   - Delete `.github/workflows/pulumi.yml`

2. **Update Docker Workflow** (optional)
   - Railway builds directly from repo, so Docker workflow for GHCR becomes optional
   - **Recommendation**: Keep it initially for rollback capability, remove later

3. **Remove Infrastructure Code**
   - **AFTER successful migration and testing**
   - Delete `packages/infrastructure/` directory
   - Update main README to remove Pulumi references

### Validation:
- ✅ Only necessary GitHub Actions remain (build-artifacts.yml + optional docker.yml)
- ✅ Deployments happen automatically on git push (via Railway)
- ✅ Release builds happen on git tag (via GitHub Actions)

---

## STEP 10: Linode Cleanup (ONLY AFTER FULL VALIDATION)

### Actions Needed:

1. **Monitor Railway for 1 Week**
   - Ensure stability and performance
   - Have rollback plan ready

2. **Delete Linode Resources**
   ```bash
   # If you still have Pulumi CLI access
   cd packages/infrastructure
   pulumi destroy
   
   # Or manually in Linode dashboard:
   # - Delete LKE cluster
   # - Delete any load balancers
   # - Delete unused volumes
   ```

3. **Cancel Linode Services**
   - Linode dashboard → Cancel unused services
   - Keep account if you want, just remove billable resources

### Validation:
- ✅ Railway is handling all traffic successfully
- ✅ GitHub Releases serving all downloads successfully
- ✅ No Linode charges on next bill
- ✅ Old infrastructure is completely removed

---

## Rollback Plan (If Something Goes Wrong)

### Quick Rollback:
1. **Change DNS back to Linode**
   ```
   A     use-covalent.com     → [Linode IP]
   CNAME api.use-covalent.com → [Linode API IP]
   ```
2. **Wait for DNS propagation (5-30 minutes)**
3. **Linode infrastructure should still be running**

### Full Rollback:
1. Database will start fresh on Linode (audit data lost, but that's okay)
2. Revert any code changes (git revert)
3. Re-enable Pulumi GitHub Actions
4. GitHub Releases will continue working regardless

---

## Timeline Estimate

- **Step 1**: 1 hour (GitHub Actions setup)
- **Step 2**: 15 minutes (Railway account)
- **Step 3**: 45 minutes (Railway services)
- **Step 4**: 30 minutes (Environment variables)
- **Step 5**: 30 minutes (Code changes)
- **Step 6**: 15 minutes (Dockerfile update)
- **Step 7**: 1 hour (DNS setup)
- **Step 8**: 2-3 hours (Testing)
- **Step 9**: 30 minutes (Cleanup)

**Total: 6-8 hours spread over 2-3 days for safety**

---

## Success Criteria - Status Update (2025-06-29)

✅ Landing page serves GitHub Release download links **COMPLETED**
✅ Desktop apps downloadable from GitHub Releases CDN **COMPLETED**
✅ VS Code + IntelliJ plugins connect to Railway backend **COMPLETED** (via local agent)
✅ License validation works: codechart ↔ license-api **COMPLETED**
❌ Audit logging works: license-api → PostgreSQL **FAILED** (PostgreSQL auth issue)
❌ Custom domains working with SSL **NOT STARTED**
⚠️ Performance equal or better than Linode **NEEDS TESTING**
✅ Deployment happens on git push (Railway) + git tag (GitHub Releases) **COMPLETED**
✅ No Kubernetes complexity **COMPLETED**
✅ Monthly cost under $25 (Railway + GitHub free) **COMPLETED**
✅ Clean separation: web services on Railway, downloads on GitHub **COMPLETED**

## Current Issues to Resolve:
1. **License-API PostgreSQL Connection**: SCRAM-SHA-256 authentication error prevents audit logging
2. **Audit Table Verification**: Check if audit_logs table exists and data is being written after connection fix
3. **Custom Domain Setup**: Step 7 not yet started
4. **GitHub Actions Cleanup**: Step 9 not yet started  
5. **Linode Cleanup**: Step 10 pending until full validation

This plan leverages Railway for web services and GitHub's global CDN for file downloads, providing better performance and simpler management than the previous Kubernetes setup.