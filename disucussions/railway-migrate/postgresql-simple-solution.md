# PostgreSQL Docker Solution - Simple Plan

## Problem
License-API can't connect to Railway's managed PostgreSQL due to authentication incompatibility.

## Solution
Deploy the same Bitnami PostgreSQL that worked in Kubernetes, just as a Railway service.

---

## Step 1: Create PostgreSQL Dockerfile

Create `packages/postgresql/Dockerfile`:
```dockerfile
FROM bitnami/postgresql:12.2.6

# Same exact config as Kubernetes Helm chart
ENV POSTGRESQL_USERNAME=license-api
ENV POSTGRESQL_DATABASE=license-api
ENV POSTGRESQL_PASSWORD=license_api_secure_password

EXPOSE 5432
```

---

## Step 2: Deploy PostgreSQL Service

1. **Railway Dashboard** → Add New Service
2. **Source**: GitHub Repository (codechart/codechart)
3. **Service name**: `postgresql`
4. **Build Path**: `packages/postgresql`
5. **Dockerfile Path**: `packages/postgresql/Dockerfile`
6. **Deploy**

---

## Step 3: Update License-API Environment Variables

**Remove:**
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**Add:**
```env
DB_HOST=${{postgresql.RAILWAY_PRIVATE_DOMAIN}}
DB_PORT=5432
DB_USER=license-api
DB_PASSWORD=license_api_secure_password
DB_NAME=license-api
```

**Redeploy license-api service**

---

## Step 4: Remove Old PostgreSQL

Delete Railway's managed PostgreSQL service after confirming the new one works.

---

## Result
- Same exact PostgreSQL setup that worked in Kubernetes
- License-API uses existing fallback code (individual env vars)
- Authentication compatibility resolved
- Audit table created automatically

**Time**: 30-60 minutes