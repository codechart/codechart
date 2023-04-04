import { getNamespace } from "../utils";
import * as k8s from "@pulumi/kubernetes";

export const nginxIngressController = (provider: k8s.Provider) => {
  const ns = getNamespace("nginx-ingress-controller", provider);

  // deploy the bitnami nginx-ingress-controller chart
  new k8s.helm.v3.Release(
    "nginx-ingress-controller",
    {
      chart: "nginx-ingress-controller",
      repositoryOpts: {
        repo: "https://charts.bitnami.com/bitnami",
      },
      namespace: ns.metadata.name,
      version: "9.4.0",
      values: {
        kind: "DaemonSet",
        daemonset: {
          useHostPort: true,
        },
        resources: {
          requests: {
            cpu: "10m",
            memory: "20Mi",
          },
        },
        defaultBackend: {
          enabled: false,
        },
        service: {
          type: "ClusterIP",
        },
      },
    },
    { provider }
  );
};
