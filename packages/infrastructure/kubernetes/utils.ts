import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import { execSync } from "child_process";

export const getNamespace = (name: string, provider: k8s.Provider) => {
  return new k8s.core.v1.Namespace(name, {}, { provider });
};

export const getGhcrImagePullSecret = (
  provider: k8s.Provider,
  uniqueName: string,
  namespace: k8s.core.v1.Namespace
) => {
  const config = new pulumi.Config();
  const username = config.require("ghcrUsername");
  const password = config.requireSecret("ghcrPassword");
  const registry = "ghcr.io";

  // put the username password into dockerconfigjson format
  let base64JsonEncodedCredentials: pulumi.Output<string> = pulumi
    .all([username, password, registry])
    .apply(([username, password, registry]) => {
      const base64Credentials = Buffer.from(username + ":" + password).toString(
        "base64"
      );
      const json = `{"auths":{"${registry}":{"auth":"${base64Credentials}"}}}`;
      return Buffer.from(json).toString("base64");
    });

  return new k8s.core.v1.Secret(
    `ghcr-pull-secret-${uniqueName}`,
    {
      metadata: { namespace: namespace.metadata.name },
      type: "kubernetes.io/dockerconfigjson",
      data: {
        ".dockerconfigjson": base64JsonEncodedCredentials,
      },
    },
    { provider }
  );
};

// getService creates a Kubernetes Service for the given Deployment
export const getService = (
  uniqueName: string,
  deployment: k8s.apps.v1.Deployment,
  provider: k8s.Provider,
  ports: [k8s.types.input.core.v1.ServicePort]
) => {
  return new k8s.core.v1.Service(
    uniqueName,
    {
      metadata: {
        namespace: deployment.metadata.namespace,
        labels: deployment.spec.template.metadata.labels,
      },
      spec: {
        type: "ClusterIP",
        ports,
        selector: deployment.spec.template.metadata.labels,
      },
    },
    { provider }
  );
};

// getIngress creates a Kubernetes Ingress for the given Service
export const getIngress = (
  uniqueName: string,
  service: k8s.core.v1.Service,
  host: string,
  provider: k8s.Provider
) => {
  return new k8s.networking.v1.Ingress(
    uniqueName,
    {
      metadata: {
        namespace: service.metadata.namespace,
        labels: service.metadata.labels,
        annotations: {
          "cert-manager.io/cluster-issuer": "letsencrypt-prod",
        },
      },
      spec: {
        ingressClassName: "nginx",
        rules: [
          {
            host,
            http: {
              paths: [
                {
                  path: "/",
                  pathType: "Prefix",
                  backend: {
                    service: {
                      name: service.metadata.name,
                      port: { name: service.spec.ports[0].name },
                    },
                  },
                },
              ],
            },
          },
        ],
        tls: [{ secretName: `${uniqueName}-tls`, hosts: [host] }],
      },
    },
    { provider }
  );
};

export const getImageTag = () => {
  // use node's child_process to run git rev-parse
  const shortSha = execSync("git rev-parse --short HEAD").toString();
  return `sha-${shortSha}`;
};

export const ignoreContainerImageChanges = () => {
  if (pulumi.runtime.isDryRun()) {
    return ["spec.template.spec.containers[0].image"];
  }
  if (process.env.CI !== "true") {
    return ["spec.template.spec.containers[0].image"];
  }
  return [];
};
