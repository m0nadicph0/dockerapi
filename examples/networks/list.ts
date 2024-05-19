import { Docker } from "../../mod.ts";

const docker = new Docker("/var/run/docker.sock");

const networks = await docker.networks.list();

console.log(`%cNETWORK ID\tNAME\tDRIVER\tSCOPE`, "color: cyan");
networks.forEach((network) => {
  console.log(
    `${
      network.Id.substring(1, 10)
    }\t${network.Name}\t${network.Driver}\t${network.Scope}`,
  );
});
