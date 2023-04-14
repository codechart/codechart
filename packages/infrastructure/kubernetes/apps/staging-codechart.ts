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

export const stagingCodechart = (provider: k8s.Provider) => {
  const ns = getNamespace("staging-codechart", provider);

  const config = new pulumi.Config();

  const pvc = new k8s.core.v1.PersistentVolumeClaim("staging-codechart", {
    metadata: { namespace: ns.metadata.name },
    spec: {
      accessModes: ["ReadWriteOnce"],
      resources: { requests: { storage: "10Gi" } },
    },
  });

  const stagingCodechartLabels = { app: "staging-codechart" };
  const probe: k8s.types.input.core.v1.Probe = {
    httpGet: {
      path: "/isUp",
      port: "http",
    },
    periodSeconds: 120,
  };
  const dep = new k8s.apps.v1.Deployment(
    "staging-codechart",
    {
      metadata: {
        namespace: ns.metadata.name,
        labels: stagingCodechartLabels,
      },
      spec: {
        replicas: 1,
        selector: { matchLabels: stagingCodechartLabels },
        // strategy: { type: "Recreate" }, // TODO: Remove this line when we scale beyond a single node
        template: {
          metadata: { labels: stagingCodechartLabels },
          spec: {
            imagePullSecrets: [
              {
                name: getGhcrImagePullSecret(provider, "staging-codechart", ns)
                  .metadata.name,
              },
            ],
            enableServiceLinks: false,
            containers: [
              {
                name: "staging-codechart",
                image: `ghcr.io/codechart/codechart:${getImageTag()}`,
                resources: { requests: { cpu: "30m", memory: "60Mi" } },
                livenessProbe: probe,
                readinessProbe: probe,
                ports: [{ containerPort: 2900, name: "http" }],
                volumeMounts: [
                  {
                    name: "staging-codechart",
                    mountPath: "/usr/src/app/config",
                    subPath: "config",
                  },
                  {
                    name: "staging-codechart",
                    mountPath: "/root/.codechart",
                    subPath: "data",
                  },
                  {
                    name: "staging-codechart",
                    mountPath: "/root/projects",
                    subPath: "projects",
                  },
                ],
              },
            ],
            volumes: [
              {
                name: "staging-codechart",
                persistentVolumeClaim: { claimName: pvc.metadata.name },
              },
            ],
          },
        },
      },
    },
    { provider, ignoreChanges: ignoreContainerImageChanges() }
  );

  const svc = getService("staging-codechart", dep, provider, [
    { port: 2900, targetPort: "http", name: "http" },
  ]);

  getIngress(
    "staging-codechart",
    svc,
    `staging.${config.require("host")}`,
    provider
  );
};
