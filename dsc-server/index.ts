import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

// create a compute instance
// n1-standard-2 is the default machine type`
const network = new gcp.compute.Network("network");
// add network tags to the instance
const tags = new gcp.compute.Tags("tags", {
    network: network.id,
    tags: ["http-server", "https-server"],
});
const computeFirewall = new gcp.compute.Firewall("firewall", {
    network: network.id,
    allows: [{
        protocol: "tcp",
        ports: [ "22"],
    },
    {
        protocol: "tcp",
        ports: [ "80" ],
    },
    {
        protocol: "tcp",
        ports: [ "443" ],
    }],
    sourceRanges: [ "0.0.0.0/0" ],
});

// attach a static public ip to the instance
const ip = new gcp.compute.Address("dsc-ip", {
    region: "asia-south1",
});

const instance = new gcp.compute.Instance("dsc-server", {
    machineType: "e2-medium",
    zone: "asia-south1-a",
    // bootDisk of size 100GB
    bootDisk: {
        initializeParams: {
            // ubuntu 20.04 LTS
            image: "ubuntu-os-cloud/ubuntu-2004-lts",
            size: 100,
        },
    },
    // attach the public ip to the instance and attach firewall rule
    networkInterfaces: [{
        network: network.id,
        accessConfigs: [{
            natIp: ip.address,
        }],
    }],
    
});
