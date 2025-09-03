# PostgreSQL Docker Solution - Railway Migration

## Problem
License-API failing with PostgreSQL authentication error because Railway's managed PostgreSQL uses incompatible SCRAM-SHA-256-PLUS authentication.

## Solution
Use the same Bitnami PostgreSQL Docker setup that worked perfectly in Kubernetes.

---

## Step 1: Create PostgreSQL Docker Container

### 1.1 Create PostgreSQL Dockerfile
The Kubernetes setup used Bitnami PostgreSQL version 12.2.6. Create `packages/postgresql/Dockerfile`:
```dockerfile
FROM bitnami/postgresql:12.2.6

# Use same configuration as Kubernetes Helm chart
ENV POSTGRESQL_USERNAME=license-api
ENV POSTGRESQL_DATABASE=license-api
# Password will be set via Railway environment variable

EXPOSE 5432
```

### 1.2 Create PostgreSQL Service on Railway
1. Railway Dashboard → Add New Service
2. Source: GitHub Repository (codechart/codechart) 
3. Service name: `postgresql`
4. Build settings:
   - **Build Path**: `packages/postgresql`
   - **Dockerfile Path**: `packages/postgresql/Dockerfile`
5. Deploy

### 1.3 Configure PostgreSQL Environment Variables
Based on the old Kubernetes configuration, set these environment variables for the PostgreSQL service:
```env
POSTGRESQL_USERNAME=license-api
POSTGRESQL_PASSWORD=license_api_password
POSTGRESQL_DATABASE=license-api
POSTGRES_PASSWORD=license_api_password
```

---

## Step 2: Update License-API Configuration

### 2.1 Update License-API Environment Variables
In the license-api service, replace the current DATABASE_URL with individual variables:

**Remove:**
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**Add:**
```env
DB_HOST=${{postgresql.RAILWAY_PRIVATE_DOMAIN}}
DB_PORT=5432
DB_USER=license-api
DB_PASSWORD=license_api_password
DB_NAME=license-api
```

### 2.2 Redeploy License-API
The license-api code already supports these environment variables (it's the fallback in the code we wrote), so it should work immediately.

---

## Step 3: Test and Cleanup

### 3.1 Verify Connection
1. Check license-api logs for successful startup
2. Verify no authentication errors
3. Test license validation from desktop app

### 3.2 Remove Railway Managed PostgreSQL
Once confirmed working:
1. Delete the old Railway managed PostgreSQL service
2. This reduces cost and complexity

---

## Expected Result
- License-API connects successfully using the same Bitnami PostgreSQL that worked in Kubernetes
- Audit table gets created automatically
- License validation works end-to-end
- Same configuration as before, just deployed on Railway instead of Kubernetes

## Time Estimate
30-60 minutes total