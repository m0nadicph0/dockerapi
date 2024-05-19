import { Docker } from "../../mod.ts";

const docker = new Docker("/var/run/docker.sock");

for (let i = 0; i < 10; i++) {
  const response = await docker.system.ping();
  console.log(`Ping responded with %c${response}`, "color: green");

  await new Promise((resolve) => setTimeout(resolve, 1000));
}
