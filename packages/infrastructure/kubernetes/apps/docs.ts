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

export const docs = (provider: k8s.Provider) => {
  const ns = getNamespace("docs", provider);

  const config = new pulumi.Config();
  const stagingCodechartLabels = { app: "docs" };
  const probe: k8s.types.input.core.v1.Probe = {
    httpGet: {
      path: "/",
      port: "http",
    },
    periodSeconds: 120,
  };
  const dep = new k8s.apps.v1.Deployment(
    "docs",
    {
      metadata: {
        namespace: ns.metadata.name,
        labels: stagingCodechartLabels,
      },
      spec: {
        replicas: 1,
        selector: { matchLabels: stagingCodechartLabels },
        template: {
          metadata: { labels: stagingCodechartLabels },
          spec: {
            imagePullSecrets: [
              {
                name: getGhcrImagePullSecret(provider, "docs", ns).metadata
                  .name,
              },
            ],
            enableServiceLinks: false,
            containers: [
              {
                name: "docs",
                image: `ghcr.io/codechart/docs:${getImageTag()}`,
                resources: { requests: { cpu: "10m", memory: "10Mi" } },
                livenessProbe: probe,
                readinessProbe: probe,
                ports: [{ containerPort: 80, name: "http" }],
              },
            ],
          },
        },
      },
    },
    { provider, ignoreChanges: ignoreContainerImageChanges() }
  );

  const svc = getService("docs", dep, provider, [
    { port: 80, targetPort: "http", name: "http" },
  ]);

  getIngress("docs", svc, `docs.${config.require("host")}`, provider);
};
