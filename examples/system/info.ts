import { Docker } from "../../mod.ts";

const docker = new Docker("/var/run/docker.sock");

const info = await docker.system.info();

console.log(info);
