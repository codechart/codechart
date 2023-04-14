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

export const landingPage = (provider: k8s.Provider) => {
  const ns = getNamespace("landing-page", provider);

  const config = new pulumi.Config();
  const stagingCodechartLabels = { app: "landing-page" };
  const probe: k8s.types.input.core.v1.Probe = {
    httpGet: {
      path: "/",
      port: "http",
    },
    periodSeconds: 120,
  };
  const dep = new k8s.apps.v1.Deployment(
    "landing-page",
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
                name: getGhcrImagePullSecret(provider, "landing-page", ns)
                  .metadata.name,
              },
            ],
            enableServiceLinks: false,
            containers: [
              {
                name: "landing-page",
                image: `ghcr.io/codechart/landing-page:${getImageTag()}`,
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

  const svc = getService("landing-page", dep, provider, [
    { port: 80, targetPort: "http", name: "http" },
  ]);

  getIngress("landing-page", svc, config.require("host"), provider);
};
