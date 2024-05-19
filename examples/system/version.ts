import { Docker } from "../../mod.ts";

const docker = new Docker("/var/run/docker.sock");

const version = await docker.system.version();

console.log(version);
