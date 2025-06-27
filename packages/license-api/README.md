# License API

It serves a web server on port `3000`.

## Configuration

| Environment Variable | Default    |
| -------------------- | ---------- |
| DB_HOST              | `auditdb`  |
| DB_PORT              | `5432`     |
| DB_USER              | `postgres` |
| DB_PASSWORD          | `postgres` |
| DB_NAME              | `postgres` |

## Routes

### /api/v1/health/alive

Liveness probe.

### /api/v1/license/approve

Approves or rejects a license request.

### /api/v1/audit

Audits an action. Send it a POST call with the following properties:

```json
{
  "macAddress": "string",
  "action": "string"
}
```

For example:

```json
{
  "macAddress": "00:1B:44:11:3A:B7",
  "action": "refresh"
}
```

<!-- Test change for Railway deployment trigger -->
