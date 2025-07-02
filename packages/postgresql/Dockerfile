FROM bitnami/postgresql:12

# also added mount on railway!
VOLUME ["/bitnami/postgresql/data"]

# Same exact config as Kubernetes Helm chart
ENV POSTGRESQL_USERNAME=license-api
ENV POSTGRESQL_DATABASE=license-api
ENV POSTGRESQL_PASSWORD=license_api_secure_password

EXPOSE 5432