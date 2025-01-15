import * as k8s from "@pulumi/kubernetes";
import { Output } from "@pulumi/pulumi";
import { nginxIngressController } from "./apps/nginx-ingress-controller";
import { licenseApi } from "./apps/license-api";
import { certManager } from "./apps/cert-manager";
import { stagingCodechart } from "./apps/staging-codechart";
import { landingPage } from "./apps/landing-page";
import { docs } from "./apps/docs";

export const kubernetes = (kubeconfig: Output<string>) => {
  const provider = new k8s.Provider("codechart", { kubeconfig });
  nginxIngressController(provider);
  licenseApi(provider);
  certManager(provider);
  stagingCodechart(provider);
  // landingPage(provider);
  docs(provider);
};
