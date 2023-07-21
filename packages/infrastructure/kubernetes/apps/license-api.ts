import {
  getGhcrImagePullSecret,
  getImageTag,
  getIngress,
  getNamespace,
  getService,
  ignoreContainerImageChanges,
} from "../utils";
import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

export const licenseApi = (provider: k8s.Provider) => {
  const ns = getNamespace("license-api", provider);

  const config = new pulumi.Config();
  const auth = {
    username: "license-api",
    password: config.requireSecret("licenseApiPostgresPassword"),
    database: "license-api",
  };

  // deploy the bitnami postgresql chart
  const dbRelease = new k8s.helm.v3.Release(
    "license-api-postgresql",
    {
      chart: "postgresql",
      repositoryOpts: { repo: "https://charts.bitnami.com/bitnami" },
      namespace: ns.metadata.name,
      version: "12.2.6",
      values: {
        auth,
        persistence: { size: "10Gi" },
        primary: {
          service: { type: "NodePort", nodePorts: { postgresql: "32345" } },
        },
      },
    },
    { provider }
  );

  const licenseApiAppLabels = { app: "license-api" };
  const probe: k8s.types.input.core.v1.Probe = {
    httpGet: {
      path: "/api/v1/health/alive",
      port: "http",
    },
    periodSeconds: 120,
  };

  // license-api kubernetes deployment
  const dep = new k8s.apps.v1.Deployment(
    "license-api",
    {
      metadata: { namespace: ns.metadata.name, labels: licenseApiAppLabels },
      spec: {
        replicas: 1,
        selector: { matchLabels: licenseApiAppLabels },
        template: {
          metadata: { labels: licenseApiAppLabels },
          spec: {
            imagePullSecrets: [
              {
                name: getGhcrImagePullSecret(provider, "license-api", ns)
                  .metadata.name,
              },
            ],
            enableServiceLinks: false,
            containers: [
              {
                name: "license-api",
                image: `ghcr.io/codechart/license-api:${getImageTag()}`,
                resources: { requests: { cpu: "10m", memory: "20Mi" } },
                livenessProbe: probe,
                readinessProbe: probe,
                ports: [{ containerPort: 3000, name: "http" }],
                env: [
                  {
                    name: "DB_HOST",
                    value: dbRelease.resourceNames["Service/v1"][0].apply(
                      (nsAndName) => nsAndName.split("/")[1]
                    ),
                  },
                  { name: "DB_USER", value: auth.username },
                  { name: "DB_PASSWORD", value: auth.password },
                  { name: "DB_NAME", value: auth.database },
                ],
              },
            ],
          },
        },
      },
    },
    { provider, ignoreChanges: ignoreContainerImageChanges() }
  );

  const svc = getService("license-api", dep, provider, [
    { port: 3000, targetPort: "http", name: "http" },
  ]);

  getIngress("license-api", svc, `license.${config.require("host")}`, provider);
};
