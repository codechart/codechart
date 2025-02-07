import * as linode from "@pulumi/linode";
import * as pulumi from "@pulumi/pulumi";

// a linode kubernetes (LKE) cluster
const lkeCluster = new linode.LkeCluster("codechart", {
  k8sVersion: "1.31",
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

const ip = lkeCluster.pools[0].nodes[0].id.apply(async (id) => {
  const nodes = await linode.getInstances({
    filters: [{ name: "label", values: [id], matchBy: "substring" }],
  });
  return nodes.instances[0].ipAddress;
});

const config = new pulumi.Config();

const domain = new linode.Domain("use-covalent", {
  type: "master",
  domain: config.require("host"),
  soaEmail: "linode-domain-soa-email@" + config.require("host"),
});

const domainId = domain.id.apply((id) => Number(id));

// we need to direct use-covalent.com and *.use-covalent.com to the ip of the linode instance
const mainRecord = new linode.DomainRecord("main-use-covalent", {
  domainId,
  recordType: "A",
  target: ip,
});
const subdomainRecord = new linode.DomainRecord("subdomain-use-covalent", {
  domainId,
  recordType: "A",
  target: ip,
  name: "*",
});
