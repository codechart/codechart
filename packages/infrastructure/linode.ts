import * as linode from "@pulumi/linode";

// a linode kubernetes (LKE) cluster
const lkeCluster = new linode.LkeCluster("codechart", {
  k8sVersion: "1.25",
  label: "codechart",
  pools: [
    {
      count: 1,
      type: "g6-standard-1",
    },
  ],
  region: "eu-central",
});

export const kubeconfig = lkeCluster.id.apply(async (id) => {
  const cluster = await linode.getLkeCluster({ id: Number(id) });
  return Buffer.from(cluster.kubeconfig, "base64").toString();
});
