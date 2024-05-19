import { Docker } from "../../mod.ts";
import { Container } from "../../lib/container.ts";

const docker = new Docker("/var/run/docker.sock");

const containers = await docker.containers.list();

if (containers.length == 0) {
  console.log("%cNo containers found", "color: red");
  Deno.exit(1);
}

containers.forEach(async (c: Container) => {
  const info = await c.inspect();
  console.log(`${info.Id} - ${info.Name.substring(1)}`);
  const response = prompt(
    `Do you want to kill the container named ${info.Name} ?`,
    "no",
  );
  if (response === "yes") {
    console.log(`Killing container ${info.Name.substring(1)}`);
    await c.kill();
  }
});
