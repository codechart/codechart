# 🚀 Railway Migration Plan - Step by Step

## 📋 Executive Summary

**Goal:** Migrate CodeChart from Linode Kubernetes to Railway PaaS deployment
**instructions from user** 
1. execute the steps one by one. 
2. commit code if relevant after every step. 
3. alert me when you need something from the user to continue. 
4. also alert me also when you feel that you got stuck d
5. write clearly in a new file log of what you do


**Strategy:** 
- Test on `railway-test` branch first
- Move downloads to GitHub Releases CDN
- Deploy only 2 services: landing-page + license-api
- Use Railway's managed PostgreSQL
- Maintain rollback capability via DNS

**Timeline:** ~2-3 hours active work + 1 week monitoring

**Cost Impact:** $20/month → $15/month (~25% savings)

**Risk Level:** Low (branch-based testing + DNS rollback)

---

Based on my analysis, here's a minimal, safe migration plan:

## 📋 Code Changes Required (Minimal)

### 1. **License API Database Connection** 
**File**: `packages/license-api/services/v1/audit/audit.go:25-30`
```go
// BEFORE (K8S individual env vars)
db = pg.Connect(&pg.Options{
    Addr:     os.Getenv("DB_HOST") + ":" + os.Getenv("DB_PORT"),
    User:     os.Getenv("DB_USER"),
    Password: os.Getenv("DB_PASSWORD"),
    Database: os.Getenv("DB_NAME"),
})

// AFTER (Railway single DATABASE_URL)
databaseURL := os.Getenv("DATABASE_URL")
if databaseURL == "" {
    databaseURL = "postgres://localhost:5432/postgres" // fallback
}
opts, err := pg.ParseURL(databaseURL)
if err != nil {
    panic(err)
}
db = pg.Connect(opts)
```

### 2. **Landing Page Download Links**
**File**: `packages/landing-page/src/components/Downloads.tsx:28,45,55,64,65`
```typescript
// BEFORE (local files)
link: "/download/covalent-js.tar.gz"
link: "/download/covalent-win.zip"
link: "/download/covalent-mac.tar.gz"
link: "/download/covalent-linux.tar.gz"
link: "/download/covalent-vscode-plugin-1.0.0.vsix"
link: "/download/Covalent-IJ-Plugin.zip"

// AFTER (GitHub Releases)
const GITHUB_REPO = process.env.REACT_APP_GITHUB_REPO || 'codechart/codechart'
const DOWNLOAD_BASE = `https://github.com/${GITHUB_REPO}/releases/latest/download`

link: `${DOWNLOAD_BASE}/covalent-js.tar.gz`
link: `${DOWNLOAD_BASE}/covalent-win.zip`
link: `${DOWNLOAD_BASE}/covalent-mac.tar.gz`
link: `${DOWNLOAD_BASE}/covalent-linux.tar.gz`
link: `${DOWNLOAD_BASE}/covalent-vscode-plugin-1.0.0.vsix`
link: `${DOWNLOAD_BASE}/Covalent-IJ-Plugin.zip`
```

### 3. **Remove Landing Page Dockerfile Dependencies**
**File**: `Dockerfile:103-105`
```dockerfile
# REMOVE these lines (artifacts no longer copied from build stages)
# COPY --from=downloads-packager /usr/src/app/download /usr/share/nginx/html/download
# COPY --from=intellij-plugin /usr/src/app/build/distributions/Covalent-IJ-Plugin.zip /usr/share/nginx/html/download/
# COPY --from=vscode-plugin /usr/src/app/covalent-vscode-plugin-1.0.0.vsix /usr/share/nginx/html/download/
```

---

## 📝 Step-by-Step Migration

### **STEP 0: Verify Required Tools**

**Purpose:** Ensure all shell tools and CLIs are available for automation

#### 🤖 **AI Agent Can Do:**
```bash
# Verify all required tools are available and working
echo "=== Tool verification ==="
for tool in curl git jq gh railway nslookup openssl sed grep; do
  if which $tool >/dev/null 2>&1; then
    echo "✅ $tool: $(which $tool)"
  else
    echo "❌ $tool: not found"
    exit 1
  fi
done

# Verify authentication status
echo "=== Authentication Status ==="
gh auth status
echo ""
railway whoami

echo "=== Ready for migration ==="
```

#### 👤 **User Must Do:**
- Nothing - all tools are already installed and authenticated

#### ✅ **Tests:**
- 🤖 **AI**: All 9 required tools available *(timeout: 30s)*
- 🤖 **AI**: GitHub CLI authenticated *(timeout: 10s)*
- 🤖 **AI**: Railway CLI authenticated *(timeout: 10s)*

---

### **STEP 1: Create Test Branch**

**Purpose:** Create isolated branch for Railway migration testing

#### 🤖 **AI Agent Can Do:**
```bash
# Create and switch to railway-test branch
git checkout -b railway-test

# Verify branch creation
git branch --show-current
```

#### 👤 **User Must Do:**
- Nothing - fully automated

#### ✅ **Tests:**
- 🤖 **AI**: `git branch --show-current` returns "railway-test" *(timeout: 5s)*
- 🤖 **AI**: `git status` shows clean working directory *(timeout: 5s)*

---

### **STEP 2: Create GitHub Release Workflow**

**Purpose:** Setup automated artifact building and GitHub Releases for downloads

#### 🤖 **AI Agent Can Do:**
```bash
# Copy existing docker workflow
cp .github/workflows/docker.yml .github/workflows/build-artifacts.yml

# Modify trigger from branches to tags
sed -i 's/branches: \["main"\]/tags: ["v*"]/' .github/workflows/build-artifacts.yml
sed -i 's/on:/on:\n  push:/' .github/workflows/build-artifacts.yml

# Add GitHub Release creation step before the build jobs
sed -i '/jobs:/i\
  create-release:\
    runs-on: ubuntu-latest\
    outputs:\
      upload_url: ${{ steps.create_release.outputs.upload_url }}\
    steps:\
      - name: Create Release\
        id: create_release\
        uses: actions/create-release@v1\
        env:\
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}\
        with:\
          tag_name: ${{ github.ref }}\
          release_name: Release ${{ github.ref }}\
          draft: false\
          prerelease: false\
' .github/workflows/build-artifacts.yml

# Make build jobs depend on create-release
sed -i '/build-or-delete-images:/a\
    needs: create-release' .github/workflows/build-artifacts.yml

# Commit workflow
git add .github/workflows/build-artifacts.yml
git commit -m "feat: add GitHub Release workflow"
git push origin railway-test

# Create test tag to trigger the release workflow
git tag v1.0.0-test
git push origin v1.0.0-test
```

#### 👤 **User Must Do:**
- Nothing - fully automated

#### ✅ **Tests:**
- 🤖 **AI**: `git log --oneline -1` shows workflow commit *(timeout: 5s)*
- 🤖 **AI**: `git ls-remote --tags origin` shows v1.0.0-test tag *(timeout: 10s)*
- 🤖 **AI**: `gh api repos/:owner/:repo/actions/workflows/build-artifacts.yml/runs --jq '.workflow_runs[0].status'` shows "completed" *(timeout: 300s)*
- 🤖 **AI**: `gh api repos/:owner/:repo/actions/workflows/build-artifacts.yml/runs --jq '.workflow_runs[0].conclusion'` shows "success" *(timeout: 5s)*
- 🤖 **AI**: `gh api repos/:owner/:repo/releases/latest --jq '.assets | length'` shows 6+ assets *(timeout: 10s)*
- 🤖 **AI**: `curl -I "https://github.com/codechart/codechart/releases/latest/download/covalent-linux.tar.gz"` returns 200 OK *(timeout: 30s)*
- 🤖 **AI**: `curl -I "https://github.com/codechart/codechart/releases/latest/download/covalent-win.zip"` returns 200 OK *(timeout: 30s)*
- 🤖 **AI**: `curl -I "https://github.com/codechart/codechart/releases/latest/download/covalent-vscode-plugin-1.0.0.vsix"` returns 200 OK *(timeout: 30s)*

---

### **STEP 3: Add Railway Deploy to Docker Workflow**

**Purpose:** Extend existing Docker workflow to deploy to Railway on railway-test branch

#### 🤖 **AI Agent Can Do:**
```bash
# Modify existing docker.yml to trigger on railway-test branch
sed -i 's/branches: \["main"\]/branches: ["main", "railway-test"]/' .github/workflows/docker.yml

# Add Railway deployment job at end
cat >> .github/workflows/docker.yml << 'EOF'

  deploy-to-railway:
    needs: build-or-delete-images
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/railway-test'
    steps:
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          railway redeploy --service landing-page
          railway redeploy --service license-api
EOF

git add .github/workflows/docker.yml
git commit -m "feat: add Railway deployment"
git push origin railway-test
```

#### 👤 **User Must Do:**
- **Add RAILWAY_TOKEN to GitHub Secrets** (get from Railway dashboard → Account → Tokens)

#### ✅ **Tests:**
- 🤖 **AI**: `grep -A 10 "deploy-to-railway" .github/workflows/docker.yml` shows new job *(timeout: 5s)*
- 🤖 **AI**: `git status` shows no uncommitted changes *(timeout: 5s)*
- 🤖 **AI**: `gh api repos/:owner/:repo/actions/workflows/docker.yml/runs --jq '.workflow_runs[0].status'` shows "completed" *(timeout: 300s)*
- 🤖 **AI**: `gh api repos/:owner/:repo/actions/workflows/docker.yml/runs --jq '.workflow_runs[0].jobs[] | select(.name | contains("deploy-to-railway")) | .conclusion'` shows job ran *(timeout: 10s)*
- 🤖 **AI**: `gh api repos/:owner/:repo/actions/workflows/docker.yml/runs --jq '.workflow_runs[0].jobs[].steps[] | select(.name | contains("Deploy to Railway")) | .conclusion'` shows step result *(timeout: 10s)*

**⚠️ DEPENDENCY: Requires RAILWAY_TOKEN from user before testing**

---

### **STEP 4: Create Railway Infrastructure**

**Purpose:** Create Railway project, services, and database using CLI

#### 🤖 **AI Agent Can Do:**
```bash
# Verify Railway CLI works
railway whoami

# Create new project
railway project new codechart-production

# Switch to the project
railway project use codechart-production

# Add PostgreSQL database
railway add --service postgresql

# Create landing page service
railway service new landing-page

# Create license API service  
railway service new license-api

# Configure landing page service
railway service use landing-page
railway variables set REACT_APP_GITHUB_REPO=codechart/codechart

# Configure license API service
railway service use license-api
railway variables set DATABASE_URL=\${{postgresql.DATABASE_URL}}

# Deploy from Docker images (will initially fail until images exist)
railway service use landing-page
railway up --service landing-page --image ghcr.io/codechart/landing-page:railway-test

railway service use license-api  
railway up --service license-api --image ghcr.io/codechart/license-api:railway-test

# Get service URLs
echo "=== Railway Service URLs ==="
railway service use landing-page
railway domain
railway service use license-api
railway domain

# List all services and status
railway status
```

#### 👤 **User Must Do:**
- **Add RAILWAY_TOKEN to GitHub Secrets**: Get from Railway dashboard → Account → Tokens
- **Note service URLs** for Step 6 testing

#### ✅ **Tests:**
- 🤖 **AI**: `railway whoami` works *(timeout: 10s)*
- 🤖 **AI**: `railway status` shows 3 services (landing-page, license-api, postgresql) *(timeout: 30s)*
- 🤖 **AI**: `railway variables | grep DATABASE_URL` shows database connection *(timeout: 10s)*
- 🤖 **AI**: `railway service use landing-page && railway domain` returns URL *(timeout: 10s)*
- 🤖 **AI**: `railway service use license-api && railway domain` returns URL *(timeout: 10s)*
- 👤 **User**: Railway dashboard shows services (may show "Crashed" until proper images deployed)

---

### **STEP 5: Make Code Changes**

#### 🤖 **AI Agent Can Do:**
```bash
# 1. Update License API Database Connection
cp packages/license-api/services/v1/audit/audit.go packages/license-api/services/v1/audit/audit.go.backup

# Apply database connection changes (using sed or direct file editing)
sed -i.bak '25,30c\
	databaseURL := os.Getenv("DATABASE_URL")\
	if databaseURL == "" {\
		databaseURL = "postgres://localhost:5432/postgres"\
	}\
	opts, err := pg.ParseURL(databaseURL)\
	if err != nil {\
		panic(err)\
	}\
	db = pg.Connect(opts)' packages/license-api/services/v1/audit/audit.go

# 2. Update Landing Page Download Links
cp packages/landing-page/src/components/Downloads.tsx packages/landing-page/src/components/Downloads.tsx.backup

# Update download links to use GitHub Releases
sed -i 's|link: "/download/|link: `${DOWNLOAD_BASE}/|g' packages/landing-page/src/components/Downloads.tsx

# Add environment variable constants at top of file
sed -i '24i\
const GITHUB_REPO = process.env.REACT_APP_GITHUB_REPO || '\''codechart/codechart'\''\
const DOWNLOAD_BASE = `https://github.com/${GITHUB_REPO}/releases/latest/download`\
' packages/landing-page/src/components/Downloads.tsx

# 3. Update Dockerfile
cp Dockerfile Dockerfile.backup

# Comment out artifact copy lines
sed -i '103,105s/^COPY/# COPY/' Dockerfile

# Verify changes
echo "=== License API Changes ==="
diff packages/license-api/services/v1/audit/audit.go.backup packages/license-api/services/v1/audit/audit.go || true

echo "=== Landing Page Changes ==="
grep -n "DOWNLOAD_BASE\|github.com" packages/landing-page/src/components/Downloads.tsx || true

echo "=== Dockerfile Changes ==="
grep -n "^# COPY.*download" Dockerfile || true

# Commit changes
git add packages/license-api/services/v1/audit/audit.go
git add packages/landing-page/src/components/Downloads.tsx  
git add Dockerfile
git commit -m "feat: migrate to Railway deployment - update DB connection and downloads"
```

#### 👤 **User Must Do:**
- **Review code changes** to ensure they look correct
- **Test TypeScript compilation**: `cd packages/api && tsc --noEmit`
- **Test Go compilation**: `cd packages/license-api && go build`
- **Test landing page build**: `cd packages/landing-page && npm run build`

#### ✅ **Tests:**
- 🤖 **AI**: `git diff HEAD~1 --name-only` shows 3 modified files
- 👤 **User**: `tsc --noEmit` passes (no TypeScript errors)
- 👤 **User**: `go build` passes (no Go compilation errors)  
- 👤 **User**: `npm run build` passes in landing-page directory
- 🤖 **AI**: `grep "DATABASE_URL" packages/license-api/services/v1/audit/audit.go` shows new code
- 🤖 **AI**: `grep "DOWNLOAD_BASE" packages/landing-page/src/components/Downloads.tsx` shows GitHub URLs

---

### **STEP 6: Test Railway Deployment**

#### 🤖 **AI Agent Can Do:**
```bash
# Push changes to trigger deployment
git push origin railway-test

# Wait for build completion (poll GitHub API)
sleep 60

# Check GitHub Actions status
gh api repos/:owner/:repo/actions/workflows/docker.yml/runs --jq '.workflow_runs[0] | {status, conclusion, html_url}'

# Verify Docker images were pushed to GHCR
gh api repos/:owner/:repo/actions/workflows/docker.yml/runs --jq '.workflow_runs[0].jobs[] | select(.name | contains("build-or-delete-images")) | .conclusion'

# Test Railway services (if URLs provided by user)
if [ ! -z "$RAILWAY_LANDING_URL" ]; then
  curl -I "$RAILWAY_LANDING_URL" | head -1
fi

if [ ! -z "$RAILWAY_API_URL" ]; then
  curl -I "$RAILWAY_API_URL/health" | head -1  
fi

# Test GitHub Release downloads are still working
curl -I "https://github.com/codechart/codechart/releases/latest/download/covalent-linux.tar.gz" | head -1
curl -I "https://github.com/codechart/codechart/releases/latest/download/covalent-win.zip" | head -1

# Verify GHCR images exist (requires GitHub token)
gh api /user/packages/container/landing-page/versions --jq '.[0].metadata.container.tags[]' 2>/dev/null || echo "GHCR image check requires authentication"
```

#### 👤 **User Must Do:**
- **Check Railway dashboard** for deployment status (visual confirmation)
- **Test Railway landing page** loads in browser (UI validation)
- **Download one executable** to verify it works locally (end-to-end test)

#### ✅ **Tests:**
- 🤖 **AI**: `git log origin/railway-test --oneline -1` shows latest commit pushed
- 🤖 **AI**: `gh api repos/:owner/:repo/actions/workflows/docker.yml/runs --jq '.workflow_runs[0].conclusion'` shows "success"
- 🤖 **AI**: `curl -I "$RAILWAY_LANDING_URL"` returns 200 OK (if URL provided)
- 🤖 **AI**: `curl -I "$RAILWAY_API_URL"` returns 200 OK (if URL provided)
- 🤖 **AI**: `curl -s "$RAILWAY_LANDING_URL" | grep "github.com.*releases.*download"` shows GitHub download links
- 🤖 **AI**: `curl -I "https://github.com/codechart/codechart/releases/latest/download/covalent-linux.tar.gz"` returns 200 OK
- 🤖 **AI**: `gh api /user/packages/container/landing-page/versions --jq '.[0].updated_at'` shows recent GHCR update
- 👤 **User**: Railway dashboard shows both services "Running"
- 👤 **User**: Downloaded executable runs successfully locally

---

### **STEP 7: Domain Setup (Optional for Testing)**

#### 🤖 **AI Agent Can Do:**
```bash
# Test DNS resolution (if domains configured)
if [ ! -z "$PRODUCTION_DOMAIN" ]; then
  nslookup "$PRODUCTION_DOMAIN"
  curl -I "https://$PRODUCTION_DOMAIN" | head -1
fi

if [ ! -z "$API_DOMAIN" ]; then
  nslookup "$API_DOMAIN"  
  curl -I "https://$API_DOMAIN" | head -1
fi

# Verify SSL certificates
if [ ! -z "$PRODUCTION_DOMAIN" ]; then
  openssl s_client -connect "$PRODUCTION_DOMAIN:443" -servername "$PRODUCTION_DOMAIN" </dev/null 2>/dev/null | openssl x509 -noout -dates
fi
```

#### 👤 **User Must Do:**
1. **Add custom domains in Railway**:
   - Landing page service: `use-covalent.com`, `www.use-covalent.com`
   - License API service: `api.use-covalent.com`
2. **Update DNS records** at domain registrar (Namecheap):
   - Point domains to Railway-provided IPs/CNAMEs
3. **Wait for DNS propagation** (5-30 minutes)
4. **Test domain resolution** in browser

#### ✅ **Tests:**
- 🤖 **AI**: `nslookup use-covalent.com` resolves to Railway IP
- 🤖 **AI**: `curl -I https://use-covalent.com` returns 200 OK
- 🤖 **AI**: `curl -I https://api.use-covalent.com` returns 200 OK  
- 👤 **User**: SSL certificates show as valid in browser
- 👤 **User**: All domains load correctly

---

### **STEP 8: Production Cutover**

#### 🤖 **AI Agent Can Do:**
```bash
# Merge railway-test to main
git checkout main
git pull origin main
git merge railway-test
git push origin main

# Verify main branch deployment
sleep 60
gh api repos/:owner/:repo/actions/workflows/docker.yml/runs --jq '.workflow_runs[0] | {status, conclusion, html_url}'

# Wait for workflow completion if still running
while [ "$(gh api repos/:owner/:repo/actions/workflows/docker.yml/runs --jq '.workflow_runs[0].status')" = "in_progress" ]; do
  echo "Waiting for deployment to complete..."
  sleep 30
done

# Test production URLs
curl -I "https://use-covalent.com" | head -1
curl -I "https://api.use-covalent.com" | head -1

# Verify GitHub Releases still work
curl -I "https://github.com/codechart/codechart/releases/latest/download/covalent-linux.tar.gz" | head -1
```

#### 👤 **User Must Do:**
- **Review merge request** before merging to main
- **Monitor deployment** to production Railway environment
- **Test full user workflow**:
  - Visit use-covalent.com
  - Download executable
  - Run locally and test license validation
  - Install IDE plugin and test connection
- **Monitor for any issues** over 24-48 hours

#### ✅ **Tests:**
- 🤖 **AI**: `git branch --show-current` shows "main"
- 🤖 **AI**: `git log --oneline -5` shows railway-test commits in main
- 👤 **User**: Production site loads at use-covalent.com
- 👤 **User**: All downloads work from GitHub Releases
- 👤 **User**: Local codechart connects to Railway license API
- 👤 **User**: IDE plugins install and connect successfully
- 👤 **User**: Performance is acceptable

---

### **STEP 9: Cleanup (After 1 Week)**

#### 🤖 **AI Agent Can Do:**
```bash
# Remove Pulumi infrastructure (if Pulumi CLI available)
if command -v pulumi &> /dev/null; then
  cd packages/infrastructure
  pulumi destroy --stack dev --yes
  cd ../..
fi

# Remove infrastructure files
git rm -rf packages/infrastructure/
git rm .github/workflows/pulumi.yml

# Clean up backup files
rm -f packages/license-api/services/v1/audit/audit.go.backup
rm -f packages/landing-page/src/components/Downloads.tsx.backup
rm -f Dockerfile.backup
rm -f .github/workflows/docker.yml.backup

# Commit cleanup
git commit -m "cleanup: remove Linode infrastructure and backup files"
git push origin main

# Verify cleanup
echo "Remaining infrastructure files:"
find . -name "*pulumi*" -o -name "*linode*" -o -name "*k8s*" -o -name "*kubernetes*" | grep -v node_modules || echo "None found"
```

#### 👤 **User Must Do:**
- **Monitor Railway for 1 week** to ensure stability
- **Cancel Linode services** in Linode dashboard
- **Verify no Linode charges** on next bill
- **Remove old GitHub secrets** related to Linode/Pulumi (optional)

#### ✅ **Tests:**
- 🤖 **AI**: `ls packages/` doesn't show infrastructure directory
- 🤖 **AI**: `ls .github/workflows/` doesn't show pulumi.yml
- 🤖 **AI**: `git status` shows clean working directory
- 👤 **User**: Railway handling all traffic successfully for 1 week
- 👤 **User**: No Linode charges appear on next monthly bill
- 👤 **User**: Old infrastructure completely removed

---

## 🎯 Success Criteria

Each step must pass these tests before proceeding:

✅ **Downloads work from GitHub Releases**  
✅ **Landing page loads on Railway**  
✅ **License API validates licenses**  
✅ **Local codechart connects to Railway license-api**  
✅ **IDE plugins downloadable and installable**  
✅ **Performance equal or better than Linode**  
✅ **DNS rollback plan works**  

## 🚨 Rollback Plan
1. **Quick**: Change DNS back to Linode (5-30 min)
2. **Full**: `git revert` + re-enable Pulumi workflow

## 💰 Expected Benefits
- **Cost**: ~$5/month savings ($20 → $15)
- **Maintenance**: No more Kubernetes complexity
- **Reliability**: GitHub CDN for downloads
- **Performance**: Railway managed infrastructure
- **Security**: Automatic SSL certificates

## 🤖👤 **AI vs User Responsibility Summary**

### **AI Agent Can Fully Automate:**
- Git operations (branch, commit, push, merge)
- File editing and code changes
- Build/compilation testing
- Basic HTTP health checks
- Infrastructure file cleanup

### **User Must Handle:**
- Railway account setup and configuration
- GitHub Secrets management
- DNS configuration at domain registrar
- Browser-based testing and validation
- Manual download testing
- Linode account cancellation
- Production monitoring and decision making

This plan maximizes automation while clearly identifying where human intervention is required for security, external services, and validation tasks.

## 🛠️ **Tool Requirements**

### **Required Tools (All Verified Available):**
- ✅ **curl** - HTTP requests, API calls, download testing
- ✅ **git** - Branch operations, commits, merges
- ✅ **jq** - JSON parsing for API responses
- ✅ **gh** - GitHub CLI for API automation
- ✅ **railway** - Railway CLI for deployments
- ✅ **nslookup** - DNS resolution testing
- ✅ **openssl** - SSL certificate verification
- ✅ **sed, grep** - File editing and text processing

All tools are installed and authenticated. No additional setup required.