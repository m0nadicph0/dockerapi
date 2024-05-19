# dockerapi

`dockerapi` is a Deno client library for interacting with Docker. It provides a
convenient way to manage Docker containers, images, networks, volumes, and
system operations programmatically.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Containers API](#containers-api)
  - [Images API](#images-api)
  - [Networks API](#networks-api)
  - [Volumes API](#volumes-api)
  - [System API](#system-api)
- [Running Tests](#running-tests)
- [Contributing](#contributing)
- [License](#license)

## Installation

To use `dockerapi` in your Deno project, you can import it directly from the
repository:

```typescript
import { Docker } from "https://deno.land/x/dockerapi/mod.ts";
```

## Usage

### Containers API

#### Creating a Container

```typescript
const docker = new Docker("/var/run/docker.sock");

const container = await docker.containers.create("MyContainer", {
  Image: "ubuntu",
  Cmd: ["true"],
  StopTimeout: 10,
});
console.log(container.id);
```

#### Starting a Container

```typescript
const container = await docker.containers.create("MyContainer", {
  Image: "ubuntu",
  Cmd: ["sleep", "500"],
  StopTimeout: 10,
});
await container.start();
const info = await container.inspect();
console.log(info.State.Status); // "running"
```

#### Stopping a Container

```typescript
const container = await docker.containers.create("MyContainer", {
  Image: "ubuntu",
  Cmd: ["sleep", "500"],
  StopTimeout: 10,
});
await container.start();
await container.stop();
const info = await container.inspect();
console.log(info.State.Status); // "exited"
```

#### Removing a Container

```typescript
const container = await docker.containers.create("MyContainer", {
  Image: "ubuntu",
  Cmd: ["sleep", "500"],
  StopTimeout: 10,
});
await container.rm();
```

#### Renaming a Container

```typescript
const container = await docker.containers.create("MyContainer", {
  Image: "ubuntu",
  Cmd: ["sleep", "500"],
  StopTimeout: 10,
});
await container.rename("MyNewContainer");
const info = await container.inspect();
console.log(info.Name); // "/MyNewContainer"
```

#### Killing a Container

```typescript
const container = await docker.containers.create("MyContainer", {
  Image: "ubuntu",
  Cmd: ["sleep", "500"],
  StopTimeout: 10,
});
await container.start();
await container.kill();
const info = await container.inspect();
console.log(info.State.Status); // "exited"
```

#### Pausing and Unpausing a Container

```typescript
const container = await docker.containers.create("MyContainer", {
  Image: "ubuntu",
  Cmd: ["sleep", "500"],
  StopTimeout: 10,
});
await container.start();
await container.pause();
const info = await container.inspect();
console.log(info.State.Status); // "paused"

await container.unpause();
await container.stop();
```

#### Inspecting a Container

```typescript
const container = await docker.containers.create("MyContainer", {
  Image: "ubuntu",
  Cmd: ["sleep", "500"],
  StopTimeout: 10,
});
const info = await container.inspect();
console.log(info);
```

#### Listing Containers

```typescript
const containers = await docker.containers.list();
containers.forEach((c) => console.log(c.id));
```

#### Listing Container Processes

```typescript
const container = await docker.containers.create("MyContainer", {
  Image: "ubuntu",
  Cmd: ["sleep", "500"],
  StopTimeout: 10,
});
await container.start();
const info = await container.processes();
console.log(info.Processes);
```

#### Inspecting Filesystem Changes

```typescript
const container = await docker.containers.create("MyContainer", {
  Image: "ubuntu",
  Cmd: ["/bin/sh", "-c", "touch file1 file2 file3 file4 file5"],
  StopTimeout: 10,
});

await container.start();

const fsChanges = await container.fsChanges();
console.log(fsChanges);
```

#### Updating a Container

```typescript
const container = await docker.containers.create("MyContainer", {
  Image: "ubuntu",
  Cmd: ["sleep", "500"],
  StopTimeout: 10,
});

await container.update({
  CpusetCpus: "0,1",
});

const infoAfter = await container.inspect();
console.log(infoAfter.HostConfig.CpusetCpus); // "0,1"
```

#### Waiting for a Container

```typescript
const container = await docker.containers.create("MyContainer", {
  Image: "ubuntu",
  Cmd: ["sleep", "500"],
  StopTimeout: 10,
});
await container.start();
const result = await container.wait();
console.log(result.StatusCode); // 0
```

#### Getting Container Stats

```typescript
const container = await docker.containers.create("MyContainer", {
  Image: "ubuntu",
  Cmd: ["sleep", "500"],
  StopTimeout: 10,
});
const stats = await container.stats();
console.log(stats.cpu_stats.cpu_usage.percpu_usage);
```

### Images API

#### Listing Images

```typescript
const images = await docker.images.list();
console.log(images.length);
```

#### Inspecting an Image

```typescript
const images = await docker.images.list();
const image = images[0];
const info = await image.inspect();
console.log(info);
```

#### Creating an Image

```typescript
const image = await docker.images.create("busybox", "uclibc");
const info = await image.inspect();
console.log(info.RepoTags);
```

#### Getting Image History

```typescript
const image = await docker.images.create("busybox", "uclibc");
const history = await image.history();
console.log(history);
```

#### Removing an Image

```typescript
const image = await docker.images.create("busybox", "uclibc");
await image.rm();
```

#### Searching for Images

```typescript
const result = await docker.images.search("busybox", 5);
console.log(result);
```

#### Creating a New Image from a Container

```typescript
const container = await docker.containers.create("MyContainer", {
  Image: "ubuntu",
  Cmd: ["/bin/sh", "-c", "touch file1 file2 file3 file4 file5"],
  StopTimeout: 10,
});
await container.start();

const image = await docker.images.commit(container, {
  repo: "MyContainerImage",
  tag: "0.0.1",
}, {});

console.log(image.id);
```

### Networks API

#### Creating a Network

```typescript
const network = await docker.networks.create({
  Name: "MyNetwork",
});
console.log(network.id);
```

#### Removing a Network

```typescript
const network = await docker.networks.create({
  Name: "MyNetwork",
});
await network.rm();
```

#### Inspecting a Network

```typescript
const network = await docker.networks.create({
  Name: "MyNetwork",
});
const info = await network.inspect();
console.log(info);
```

#### Connecting a Container to a Network

```typescript
const container = await docker.containers.create("MyContainer", {
  Image: "ubuntu",
  Cmd: ["true"],
  StopTimeout: 10,
});
const network = await docker.networks.create({
  Name: "MyNetwork",
});
await network.connect(container);
const info = await container.inspect();
console.log(info.NetworkSettings.Networks["network-name"]);
```

#### Disconnecting a Container from a Network

```typescript
const container = await docker.containers.create("MyContainer", {
  Image: "ubuntu",
  Cmd: ["true"],
  StopTimeout: 10,
});
const network = await docker.networks.create({
  Name: "MyNetwork",
});
await network.connect(container);
await network.disconnect(container);
const info = await container.inspect();
console.log(info.NetworkSettings.Networks["network-name"]);
```

#### Listing Networks

```typescript
const networks = await docker.networks.list();
console.log(networks.length);
```

#### Pruning Unused Networks

```typescript
await docker.networks.create({ Name: "unused-network" });
await docker.networks.prune();
```

### Volumes API

#### Creating a Volume

```typescript
const docker = new Docker("/var/run/docker.sock");

const volume = await docker.volumes.create({
  Name: "myvolume",
});
console.log(volume.name);
```

#### Removing a Volume

```typescript
const volume = await docker.volumes.create({
  Name: "myvolume",
});
await volume.rm();
```

#### Inspecting a Volume

```typescript
const volume = await docker.volumes.create({
  Name: "myvolume",
});
const info = await volume.inspect();
console.log(info);
```

#### Listing Volumes

```typescript
const result = await docker.volumes.list();
console.log(result.Volumes);
await volume.rm();
```

#### Pruning Unused Volumes

```typescript
await docker.volumes.create({
  Name: "unused-volume",
});
const result = await docker.volumes.prune();
console.log(result.VolumesDeleted.length);
```

### System API

#### Getting System Information

```typescript
const docker = new Docker("/var/run/docker.sock");

const sysInfo = await docker.system.info();
console.log(sysInfo);
```

#### Getting Docker Version

```typescript
const version = await docker.system.version();
console.log(version);
```

#### Pinging Docker

```typescript
const pingResponse = await docker.system.ping();
console.log(pingResponse); // "OK"
```

#### Pinging Docker (HEAD request)

```typescript
const pingResponse = await docker.system.pingHead();
console.log(pingResponse); // "OK"
```

## Running Tests

To run the tests for this library, use the following command:

```bash
deno task test
```

The tests will automatically create, start, stop, and remove containers, images,
networks, and volumes to verify the functionality of the library.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request to
propose changes or additions.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file
for details.
