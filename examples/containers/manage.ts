import { Container } from "../../lib/container.ts";
import { Docker } from "../../mod.ts";

// Create an instance of Docker class to connect with Docker daemon using Unix socket
const docker = new Docker("/var/run/docker.sock");

async function printState(container: Container) {
  const info = await container.inspect();
  console.log(
    `Container ${
      info.Name.substring(1)
    } is currently in state %c${info.State.Status}`,
    "color: cyan",
  );
}

// Create a container
const container = await docker.containers.create("my-container", { // Calling Docker instance's create method and creating the container with the given configurations
  Image: "ubuntu",
  Cmd: ["sleep", "500"],
  StopTimeout: 10,
});

container.id &&
  console.log(`Container created with Id: ${container.id.substring(0, 10)}`);

// Starting the container which is just created
await container.start();
await printState(container);

// Pause the container
await container.pause();
await printState(container);

// Unpause the container
await container.unpause();
await printState(container);

// Stop the container
await container.stop();
await printState(container);

// Remove the container
await container.rm();
