# Railway Migration - Remaining Tasks Plan

## Overview
Complete the Railway migration by resolving the remaining issues after successful deployment of core services.

**Current Status (Updated 2025-06-29):**
- ✅ Landing page working with GitHub releases
- ✅ Desktop app working with license validation
- ✅ IDE plugins working via local agent
- ✅ PostgreSQL service created on Railway (connected to codechart repo)
- ✅ License-API environment variables updated with individual DB_* vars
- ✅ DNS records added to Namecheap (CNAME @ → do5sjyyt.up.railway.app)
- ❌ PostgreSQL Dockerfile missing (packages/postgresql/ directory doesn't exist)
- ❌ License-API PostgreSQL connection still failing (no Dockerfile to build from)
- ❌ Audit logging not verified
- ❌ Old infrastructure not cleaned up

---

## TASK 1: Fix License-API PostgreSQL Connection

### Issue:
License-API service failing with PostgreSQL authentication error:
```
panic: pg: SASL: got "SCRAM-SHA-256-PLUS", wanted "SCRAM-SHA-256"
```

### Root Cause:
Go `pg` library incompatible with Railway managed PostgreSQL authentication method.

### Historical Context:
The old Kubernetes setup used **Bitnami PostgreSQL** (version 12.2.6) with individual environment variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) and it worked perfectly. Railway's managed PostgreSQL uses different authentication that's incompatible.

### Recommended Solution: Deploy Bitnami PostgreSQL Container

Instead of using Railway's managed PostgreSQL, deploy our own Bitnami PostgreSQL as a Railway service using the existing `packages/postgresql/Dockerfile`.

### Actions Needed:

#### 1.1 Create PostgreSQL Service on Railway
✅ **COMPLETED** - PostgreSQL service created on Railway:
   - Service name: `postgresql`
   - Source: GitHub repository (codechart/codechart)
   - Root directory: `/packages/postgresql`
   - Branch: `main`

#### 1.2 Configure PostgreSQL Environment Variables
Set environment variables for the PostgreSQL service:
```env
POSTGRESQL_USERNAME=license-api
POSTGRESQL_PASSWORD=secure_password_here
POSTGRESQL_DATABASE=license-api
POSTGRES_PASSWORD=secure_password_here  # Bitnami requires this too
```

#### 1.3 Update License-API Environment Variables
✅ **COMPLETED** - License-API environment variables updated:
```env
# Removed:
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Added:
DB_HOST=${{postgresql.RAILWAY_PRIVATE_DOMAIN}}
DB_PORT=5432
DB_USER=license-api
DB_PASSWORD=license_api_secure_password
DB_NAME=license-api
```

#### 1.4 Create PostgreSQL Dockerfile
❌ **MISSING** - Need to create `packages/postgresql/Dockerfile`:
```dockerfile
FROM bitnami/postgresql:12.2.6

# Same exact config as Kubernetes
ENV POSTGRESQL_USERNAME=license-api
ENV POSTGRESQL_DATABASE=license-api
ENV POSTGRESQL_PASSWORD=license_api_secure_password

EXPOSE 5432
```

**Note**: Directory `packages/postgresql/` doesn't exist yet, causing Railway build failure.

#### 1.5 Deploy and Test
1. Deploy PostgreSQL service
2. Wait for it to be running
3. Redeploy license-api service
4. Check logs for successful connection

#### 1.6 Remove Railway Managed PostgreSQL
After confirming the custom PostgreSQL works:
1. Delete the Railway managed PostgreSQL service
2. This will reduce costs and complexity

### Alternative Solutions (if above doesn't work):
- **Option B**: Update Go `pg` library to newer version that supports SCRAM-SHA-256-PLUS
- **Option C**: Switch to different PostgreSQL Go driver (e.g., `pgx`)

### Validation:
- ✅ Custom PostgreSQL service running on Railway
- ✅ License-api service starts successfully  
- ✅ No panic errors in Railway logs
- ✅ Service responds to health checks
- ✅ Database connection established using individual env vars

---

## TASK 2: Audit Table Verification & Testing

### Issue:
Even after PostgreSQL connection is fixed, need to verify audit logging works.

### Expected Database Schema:
Table: `audit_logs`
```sql
CREATE TABLE audit_logs (
    id VARCHAR PRIMARY KEY,
    timestamp TIMESTAMP,
    mac_address VARCHAR,
    action VARCHAR,
    details VARCHAR
);
```

### Actions Needed:
1. **Connect to Railway PostgreSQL database**
   ```bash
   railway connect Postgres  # or via Railway dashboard
   ```

2. **Check if audit_logs table exists**
   ```sql
   \dt  -- List tables
   SELECT * FROM audit_logs LIMIT 5;  -- Check data
   ```

3. **Trigger audit events for testing**
   - Run desktop app license validation
   - Check if new records appear in audit_logs table
   - Verify all columns populated correctly

4. **Manual table creation if needed**
   ```sql
   CREATE TABLE IF NOT EXISTS audit_logs (
       id VARCHAR PRIMARY KEY,
       timestamp TIMESTAMP,
       mac_address VARCHAR,
       action VARCHAR,
       details VARCHAR
   );
   ```

### Validation:
- ✅ audit_logs table exists in database
- ✅ License validation creates new audit records
- ✅ All required columns populated correctly
- ✅ Timestamp, MAC address, action captured properly

---

## TASK 3: Custom Domain Setup

### Current Status:
Services using Railway-generated domains:
- Landing page: `https://landing-page-production-d88f.up.railway.app`
- License API: `https://license-api-production-99d2.up.railway.app`

### Target Domains:
- Landing page: `https://use-covalent.com` ✅ **DNS CONFIGURED**
- License API: ~~`https://api.use-covalent.com`~~ **NOT NEEDED** (only used by local desktop app)

### Actions Needed:

#### 3.1 Add Domains in Railway
1. **Landing page service** → Settings → Domains
   - Add domain: `use-covalent.com`
   - Add domain: `www.use-covalent.com` (optional)

#### 3.2 Update DNS Records (Namecheap)
✅ **COMPLETED** - DNS configured:
```
CNAME @  → do5sjyyt.up.railway.app
```
**Status**: DNS propagation in progress (5-30 minutes)

#### 3.3 Update Code References (if any)
- Check if desktop app hardcodes license-API URL
- Update any configuration files pointing to old domains

### Validation:
- ✅ `https://use-covalent.com` loads landing page
- ✅ `https://api.use-covalent.com` responds to API calls
- ✅ SSL certificates automatically provisioned
- ✅ Desktop app works with new API domain

**Testing Commands:**
```bash
curl -I https://use-covalent.com
curl -I https://api.use-covalent.com
```

---

## TASK 4: GitHub Actions Cleanup

### Current State:
Multiple GitHub Actions workflows, some no longer needed.

### Actions Needed:

#### 4.1 Remove Pulumi Workflow
```bash
rm .github/workflows/pulumi.yml
```

#### 4.2 Review Docker Workflow
- Current: `.github/workflows/docker.yml` (builds and pushes to GHCR)
- **Decision needed**: Keep for backup deployment option or remove?
- **Recommendation**: Keep initially for rollback capability, remove after 1 month

#### 4.3 Workflow Naming Consistency
- Current: `.github/workflows/docker.yml` has name "Build and Deploy to Railway"
- Verify naming is consistent across all workflows
- Update workflow descriptions if needed

#### 4.4 Ensure Release Workflow Works
- Verify `.github/workflows/build-artifacts.yml` still works
- Test by creating a git tag: `git tag v1.0.1-test && git push origin v1.0.1-test`
- Confirm GitHub Release created with all artifacts

### Validation:
- ✅ Pulumi workflow removed
- ✅ Workflow names are consistent and descriptive
- ✅ Release workflow creates GitHub releases successfully
- ✅ Landing page downloads work from new releases
- ✅ No unnecessary workflow runs

---

## TASK 5: IntelliJ Plugin Memory Leak Fix

### Issue:
IntelliJ plugin has memory leak errors during build process.

### Current Status:
- Issue was noted during earlier testing
- Lower priority since core functionality works
- May affect plugin performance over time

### Actions Needed:

#### 5.1 Identify Memory Leak Source
- Review IntelliJ plugin build logs
- Check for memory-intensive operations
- Look for unclosed resources or listeners

#### 5.2 Review Plugin Code
```bash
cd packages/intellij-plugin
./gradlew build --info  # Check build output for memory issues
```

#### 5.3 Common IntelliJ Memory Leak Causes:
- Event listeners not properly disposed
- Background tasks not canceled
- Large objects held in memory
- Improper use of application/project services

#### 5.4 Fix and Test
- Apply necessary fixes
- Test plugin installation and usage
- Monitor memory usage during operation

### Validation:
- ✅ Plugin builds without memory warnings
- ✅ Plugin operates without memory leaks
- ✅ Normal memory usage during IDE operation
- ✅ Plugin functionality remains intact

**Note:** This is a lower priority task that can be addressed after main migration is complete.

---

## TASK 6: Infrastructure Code Cleanup

### Current State:
Old Kubernetes/Pulumi infrastructure code still exists.

### Actions Needed:

#### 5.1 Remove Infrastructure Directory
**⚠️ ONLY AFTER 1 WEEK OF SUCCESSFUL RAILWAY OPERATION**
```bash
rm -rf packages/infrastructure/
```

#### 5.2 Update Documentation
- Update main `README.md` to remove Pulumi references
- Add Railway deployment instructions
- Update `CLAUDE.md` with new deployment process

#### 5.3 Archive Migration Documentation
- Move migration plans to `docs/migration/` directory
- Keep for historical reference

### Validation:
- ✅ Infrastructure directory removed
- ✅ Documentation updated
- ✅ No broken references to old deployment methods

---

## TASK 7: Final Linode Cleanup

### ⚠️ WARNING: ONLY AFTER FULL VALIDATION

### Prerequisites:
- Railway running successfully for 1+ weeks
- All functionality verified working
- Performance acceptable
- Rollback plan ready

### Actions Needed:

#### 6.1 Monitor Railway Performance
- Track uptime and response times
- Compare vs Linode performance
- Monitor costs

#### 6.2 Backup Critical Data
- Export any audit logs from old system if needed
- Document any custom configurations

#### 6.3 Delete Linode Resources
```bash
# If Pulumi still configured:
cd packages/infrastructure
pulumi destroy

# Or manually in Linode dashboard:
# - Delete LKE cluster
# - Delete load balancers
# - Delete volumes
# - Delete unused node pools
```

#### 6.4 Cancel Linode Services
- Linode dashboard → Cancel unused services
- Keep account, remove billable resources

### Validation:
- ✅ Railway handling all traffic successfully
- ✅ GitHub Releases serving downloads
- ✅ No Linode charges on next bill
- ✅ All functionality working on Railway

---

## Timeline & Priorities

### High Priority (Complete First):
1. **Fix PostgreSQL connection** (blocks audit logging)
2. **Verify audit table & testing** (core functionality)

### Medium Priority:
3. **Custom domain setup** (user experience)
4. **GitHub Actions cleanup** (maintenance)

### Low Priority (After Validation):
5. **IntelliJ plugin memory leak fix** (performance optimization)
6. **Infrastructure code cleanup** (after 1 week)
7. **Linode cleanup** (after full validation)

### Estimated Time:
- Task 1-2: 2-4 hours (debugging PostgreSQL issue)
- Task 3: 1-2 hours (domain setup)
- Task 4: 30 minutes (cleanup)
- Task 5: 30 minutes (after waiting period)
- Task 6: 1 hour (after validation period)

**Total: 4-8 hours active work + waiting periods**

---

## Success Criteria - Final

✅ **Core Functionality:**
- Landing page serves GitHub downloads
- Desktop app license validation works
- IDE plugins work via local agent
- Audit logging works to PostgreSQL

✅ **Production Ready:**
- Custom domains working with SSL
- Performance equal/better than Linode
- Automated deployments working

✅ **Clean Setup:**
- Old infrastructure removed
- Unnecessary workflows removed
- Documentation updated

✅ **Cost Effective:**
- Monthly cost under $25
- No unnecessary services running