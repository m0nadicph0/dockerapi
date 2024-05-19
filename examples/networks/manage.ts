import { Docker } from "../../mod.ts";

const docker = new Docker("/var/run/docker.sock");

const network = await docker.networks.create({
  Name: "my-network",
  Driver: "bridge",
});

network.id &&
  console.log(`Created network with ID ${network.id.substring(0, 10)}`);

// Inspect the network
const networkInfo = await network.inspect();
console.log(networkInfo);

// Remove the network
console.log(`Removing network ${networkInfo.Name}`);
await network.rm();
