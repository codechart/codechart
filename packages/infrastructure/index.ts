import { kubeconfig } from "./linode";
import { kubernetes } from "./kubernetes";

const k8s = kubernetes(kubeconfig);
