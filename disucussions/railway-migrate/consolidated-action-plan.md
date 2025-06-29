# Railway PostgreSQL Fix - Consolidated Action Plan

## Overview
Fix the license-api PostgreSQL authentication error by deploying the same Bitnami PostgreSQL that worked in Kubernetes, then complete remaining migration tasks.

**Core Problem**: License-API failing with `SCRAM-SHA-256-PLUS` authentication error because Railway's managed PostgreSQL uses incompatible authentication with the Go `pg` library.

**Solution**: Deploy custom Bitnami PostgreSQL 12.2.6 container (same as Kubernetes) using individual environment variables that the license-api code already supports.

---

## PHASE 1: PostgreSQL Docker Solution (PRIORITY 1)

### Step 1: Create PostgreSQL Dockerfile
**Directory**: `packages/postgresql/`

Create `packages/postgresql/Dockerfile`:
```dockerfile
FROM bitnami/postgresql:12.2.6

# Same exact config as Kubernetes Helm chart
ENV POSTGRESQL_USERNAME=license-api
ENV POSTGRESQL_DATABASE=license-api
ENV POSTGRESQL_PASSWORD=license_api_secure_password

EXPOSE 5432
```

### Step 2: Deploy PostgreSQL Service on Railway
1. **Railway Dashboard** → Add New Service
2. **Source**: GitHub Repository (codechart/codechart)
3. **Service name**: `postgresql`
4. **Build Path**: `packages/postgresql`
5. **Dockerfile Path**: `packages/postgresql/Dockerfile`
6. **Deploy**

### Step 3: Update License-API Environment Variables

**Remove from license-api service:**
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**Add to license-api service:**
```env
DB_HOST=${{postgresql.RAILWAY_PRIVATE_DOMAIN}}
DB_PORT=5432
DB_USER=license-api
DB_PASSWORD=license_api_secure_password
DB_NAME=license-api
```

**Redeploy license-api service**

### Step 4: Verify and Clean Up
1. **Test license-api logs** - should show successful PostgreSQL connection
2. **Test license validation** - desktop app should work end-to-end
3. **Remove Railway's managed PostgreSQL service** after confirming new setup works

**Expected Result**: License-API connects successfully, audit table created automatically, same setup as Kubernetes.

---

## PHASE 2: Verification and Testing (PRIORITY 1)

### Verify Audit Logging Works
1. **Check audit table exists**:
   ```bash
   railway shell postgresql
   psql -U license-api -d license-api
   \dt  -- List tables
   SELECT * FROM audit_logs LIMIT 5;
   ```

2. **Test audit logging**:
   - Run desktop app license validation
   - Check new records appear in audit_logs table
   - Verify columns: id, timestamp, mac_address, action, details

3. **Manual table creation if needed**:
   ```sql
   CREATE TABLE IF NOT EXISTS audit_logs (
       id VARCHAR PRIMARY KEY,
       timestamp TIMESTAMP,
       mac_address VARCHAR,
       action VARCHAR,
       details VARCHAR
   );
   ```

---

## PHASE 3: Production Setup (PRIORITY 2)

### Custom Domains Setup
1. **Add domains in Railway**:
   - Landing page service → Settings → Domains → Add `use-covalent.com` and `www.use-covalent.com`
   - License-api service → Settings → Domains → Add `api.use-covalent.com`

2. **Update DNS at Namecheap**:
   ```
   A     use-covalent.com        → [Railway IP from dashboard]
   CNAME www.use-covalent.com    → use-covalent.com
   CNAME api.use-covalent.com    → [Railway domain for license-api]
   ```

3. **Test domains**:
   ```bash
   curl -I https://use-covalent.com
   curl -I https://api.use-covalent.com
   ```

---

## PHASE 4: Cleanup (PRIORITY 3)

### GitHub Actions Cleanup
1. **Remove Pulumi workflow**:
   ```bash
   rm .github/workflows/pulumi.yml
   ```

2. **Test release workflow**:
   ```bash
   git tag v1.0.1-test && git push origin v1.0.1-test
   ```

### Code Cleanup (After 1 Week Validation)
1. **Remove infrastructure directory**:
   ```bash
   rm -rf packages/infrastructure/
   ```

2. **Update documentation** to remove Pulumi references

### Linode Cleanup (After Full Validation)
1. **Monitor Railway performance** for 1+ weeks
2. **Delete Linode resources** via dashboard or `pulumi destroy`
3. **Cancel Linode billing**

---

## Critical Review and Dependencies

### ✅ What's Good About This Plan:
- **Reuses proven setup**: Same Bitnami PostgreSQL 12.2.6 that worked in Kubernetes
- **Minimal code changes**: License-api already supports individual env vars as fallback
- **Clear phases**: High priority items first, cleanup after validation
- **Specific steps**: Exact commands and configuration provided

### ⚠️ Potential Issues to Watch:
1. **Dockerfile location**: Need to verify `packages/postgresql/` directory exists
2. **Environment variable names**: Ensure license-api code expects exactly `DB_HOST`, `DB_USER`, etc.
3. **Railway service naming**: Confirm `${{postgresql.RAILWAY_PRIVATE_DOMAIN}}` syntax is correct
4. **Password security**: Use Railway's secret management for PostgreSQL password

### 🔍 Pre-Flight Checks Needed:
1. **Verify license-api fallback code** - confirm it supports individual DB_* environment variables
2. **Check if packages/postgresql/ exists** - create directory if missing
3. **Verify Railway environment variable syntax** - confirm `${{service.VARIABLE}}` format
4. **Test PostgreSQL version compatibility** - ensure 12.2.6 works with current Go pg library

### ⏱️ Time Estimate:
- **Phase 1**: 30-60 minutes (PostgreSQL setup)
- **Phase 2**: 15-30 minutes (verification)
- **Phase 3**: 1-2 hours (domains + DNS propagation)
- **Phase 4**: 30 minutes (cleanup after waiting periods)

**Total Active Work**: 2-4 hours + waiting periods

### 🎯 Success Criteria:
- ✅ License-API starts without PostgreSQL panic errors
- ✅ Desktop app license validation works end-to-end
- ✅ Audit records appear in PostgreSQL database
- ✅ Custom domains work with SSL certificates
- ✅ Monthly cost remains under $25

This plan focuses on the core PostgreSQL issue while ensuring all migration tasks are completed systematically.