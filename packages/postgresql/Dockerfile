FROM bitnami/postgresql:15

# Match the auth settings from Kubernetes
ENV POSTGRESQL_USERNAME=license-api
ENV POSTGRESQL_DATABASE=license-api
ENV POSTGRESQL_PASSWORD=${POSTGRES_PASSWORD}

# Match the storage/performance settings
ENV POSTGRESQL_SHARED_PRELOAD_LIBRARIES=pg_stat_statements
ENV POSTGRESQL_MAX_CONNECTIONS=100

# Expose the standard PostgreSQL port
EXPOSE 5432

# Health check to match the Kubernetes probe behavior
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD pg_isready -U license-api -d license-api