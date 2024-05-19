import { Docker } from "../../mod.ts";

const docker = new Docker("/var/run/docker.sock");

const volume = await docker.volumes.create({
  Name: "MyVolume",
});

const info = await volume.inspect();

console.log(info);

await volume.rm();
