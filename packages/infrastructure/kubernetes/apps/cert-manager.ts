import { getNamespace } from "../utils";
import * as k8s from "@pulumi/kubernetes";

export const certManager = (provider: k8s.Provider) => {
  const ns = getNamespace("cert-manager", provider);

  // deploy the jetstack cert-manager chart
  new k8s.helm.v3.Release(
    "cert-manager",
    {
      chart: "cert-manager",
      repositoryOpts: {
        repo: "https://charts.jetstack.io",
      },
      namespace: ns.metadata.name,
      version: "1.11.0",
      values: {
        installCRDs: true,
        ingressShim: {
          defaultIssuerName: "letsencrypt-prod",
          defaultIssuerKind: "ClusterIssuer",
          defaultIssuerGroup: "cert-manager.io",
        },
        resources: { requests: { cpu: "10m", memory: "32Mi" } },
        webhook: { resources: { requests: { cpu: "10m", memory: "32Mi" } } },
        cainjector: { resources: { requests: { cpu: "10m", memory: "32Mi" } } },
      },
    },
    { provider }
  );

  // create the letsencrypt-prod ClusterIssuer
  new k8s.apiextensions.CustomResource("letsencrypt-prod", {
    apiVersion: "cert-manager.io/v1",
    kind: "ClusterIssuer",
    metadata: { name: "letsencrypt-prod", namespace: ns.metadata.name },
    spec: {
      acme: {
        server: "https://acme-v02.api.letsencrypt.org/directory",
        email: "tls@code-chart.com",
        privateKeySecretRef: { name: "letsencrypt-prod" },
        solvers: [{ http01: { ingress: { class: "nginx" } } }],
      },
    },
  });
};
