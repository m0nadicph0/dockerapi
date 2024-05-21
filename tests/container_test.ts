import { Docker } from "../mod.ts";

import { cname } from "./helper.ts";
import { Kind } from "../lib/types/container.ts";
import {
assert,
  assertArrayIncludes,
  assertEquals,
  assertNotEquals,
} from "std/assert/mod.ts";


const docker = new Docker("/var/run/docker.sock");

Deno.test("test create container", async () => {
  const container = await docker.containers.create(cname("create"), {
    Image: "ubuntu",
    Cmd: ["true"],
    StopTimeout: 10,
  });
  assertNotEquals(container.id, null);
  const info = await container.inspect();
  assertEquals(info.State.Status, "created");
  await container.rm();
});

Deno.test("test container start", async () => {
  const container = await docker.containers.create(cname("start"), {
    Image: "ubuntu",
    Cmd: ["sleep", "500"],
    StopTimeout: 10,
  });
  assertNotEquals(container.id, null);

  await container.start();
  const info = await container.inspect();
  assertEquals(info.State.Status, "running");
  await container.stop();
  await container.rm();
});

Deno.test("test container stop", async () => {
  const container = await docker.containers.create(cname("stop"), {
    Image: "ubuntu",
    Cmd: ["sleep", "500"],
    StopTimeout: 10,
  });
  assertNotEquals(container.id, null);
  await container.start();
  await container.stop();
  const info = await container.inspect();
  assertNotEquals(info.State.Status, "running");
  await container.rm();
});

Deno.test("test container remove", async () => {
  const container = await docker.containers.create(cname("delete"), {
    Image: "ubuntu",
    Cmd: ["true"],
    StopTimeout: 10,
  });
  assertNotEquals(container.id, null);
  await container.rm();
});

Deno.test("test container rename", async () => {
  const container = await docker.containers.create(cname("rename"), {
    Image: "ubuntu",
    Cmd: ["true"],
    StopTimeout: 10,
  });

  assertNotEquals(container.id, null);
  await container.rename("new-name");
  const info = await container.inspect();
  assertEquals(info.Name, "/new-name");
  await container.rm();
});

Deno.test("test kill container", async () => {
  const container = await docker.containers.create(cname("kill"), {
    Image: "ubuntu",
    Cmd: ["sleep", "500"],
    StopTimeout: 10,
  });
  assertNotEquals(container.id, null);
  await container.start();
  await container.kill();
  const info = await container.inspect();
  assertEquals(info.State.Status, "exited");
  await container.rm();
});

Deno.test("test pause container", async () => {
  const container = await docker.containers.create(cname("pause"), {
    Image: "ubuntu",
    Cmd: ["sleep", "500"],
    StopTimeout: 10,
  });
  assertNotEquals(container.id, null);
  await container.start();
  await container.pause();
  const info = await container.inspect();
  assertEquals(info.State.Status, "paused");
  await container.unpause();
  await container.stop();
  await container.rm();
});

Deno.test("test unpause container", async () => {
  const container = await docker.containers.create(cname("unpause"), {
    Image: "ubuntu",
    Cmd: ["sleep", "500"],
    StopTimeout: 10,
  });
  assertNotEquals(container.id, null);
  await container.start();
  await container.pause();
  await container.unpause();
  const info = await container.inspect();
  assertNotEquals(info.State.Status, "paused");
  await container.stop();
  await container.rm();
});

Deno.test("test inspect container", async () => {
  const container = await docker.containers.create(cname("inspect"), {
    Image: "ubuntu",
    Cmd: ["true"],
    StopTimeout: 10,
  });
  assertNotEquals(container.id, null);
  const info = await container.inspect();
  assertNotEquals(info, null);
  assertEquals(info.State.Status, "created");
  await container.rm();
});

Deno.test("test list containers", async () => {
  const numContainers = 5;
  for (let i = 0; i < numContainers; i++) {
    const container = await docker.containers.create(cname(`list-${i}`), {
      Image: "ubuntu",
      Cmd: ["sleep", "500"],
      StopTimeout: 10,
    });
    await container.start();
  }

  const containers = await docker.containers.list();
  assertEquals(containers.length, numContainers);
  for (const c of containers) {
    await c.kill();
    await c.rm();
  }
});

Deno.test("test list container processes", async () => {
  const container = await docker.containers.create(cname("list-processes"), {
    Image: "ubuntu",
    Cmd: ["sleep", "500"],
    StopTimeout: 10,
  });
  await container.start();
  const info = await container.processes();
  assertNotEquals(info, null);
  assertEquals(info.Processes.length, 1);
  await container.stop();
  await container.rm();
});

Deno.test("test changes on a containers filesystem", async () => {
  const container = await docker.containers.create(cname("filesystem"), {
    Image: "ubuntu",
    Cmd: ["/bin/sh", "-c", "touch file1 file2 file3 file4 file5"],
    StopTimeout: 10,
  });

  await container.start();

  const fsChanges = await container.fsChanges();
  assertEquals(fsChanges.length, 5);

  const filesAdded = fsChanges.filter((c) => {
    return c.Kind === Kind.Added;
  }).map((c) => {
    return c.Path;
  });
  assertArrayIncludes(filesAdded, [
    "/file1",
    "/file2",
    "/file3",
    "/file4",
    "/file5",
  ]);

  await container.rm();
});

Deno.test("test update container", async () => {
  const container = await docker.containers.create(cname("update"), {
    Image: "ubuntu",
    Cmd: ["sleep", "500"],
    StopTimeout: 10,
  });

  const info = await container.inspect();
  assertNotEquals(info.HostConfig.CpusetCpus, "0,1");

  await container.update({
    CpusetCpus: "0,1",
  });
  const infoAfter = await container.inspect();
  assertEquals(infoAfter.HostConfig.CpusetCpus, "0,1");

  await container.rm();
});

Deno.test("test wait container", async () => {
  const container = await docker.containers.create(cname("wait"), {
    Image: "ubuntu",
    Cmd: ["sleep", "0.1"],
    StopTimeout: 10,
  });
  await container.start();
  const result = await container.wait();
  assertEquals(result.StatusCode, 0);
  await container.rm();
});

Deno.test("test get container stats based on resource usage", async () => {
  const container = await docker.containers.create(cname("stats"), {
    Image: "ubuntu",
    Cmd: ["sleep", "500"],
    StopTimeout: 10,
  });

  const stats = await container.stats();
  assertNotEquals(stats.cpu_stats.cpu_usage.percpu_usage, null);
  await container.rm();
});

Deno.test("test get container logs", async () => {
  const container = await docker.containers.create(cname("logs"), {
    Image: "ubuntu",
    Cmd: ["echo", "Hello, World!"],
    StopTimeout: 10,
  });

  await container.start();
  const logs = await container.logs();
  assertEquals(logs.includes("Hello"), true);
  await container.rm();
});



Deno.test("test create an exec instance", async () => {
  const container = await docker.containers.create(cname("exec"), {
    Image: "ubuntu",
    Cmd: ["sleep", "500"],
    StopTimeout: 10,
  });

  await container.start();

  const exec = await container.exec({
    Cmd: ["echo", "Hello, World!"],
    AttachStdin: false,
    AttachStdout: false,
    AttachStderr: false,
    DetachKeys: "",
    Tty: false,
    Env: []
  });
  assertNotEquals(exec.id, null);
  await container.kill();
  await container.rm();
});

Deno.test("test start an exec instance", async () => {
  const container = await docker.containers.create(cname("start-exec"), {
    Image: "ubuntu",
    Cmd: ["sleep", "500"],
    StopTimeout: 10,
  });

  await container.start();

  const exec = await container.exec({
    Cmd: ["echo", "Hello, World!"],
    AttachStdin: false,
    AttachStdout: false,
    AttachStderr: false,
    DetachKeys: "",
    Tty: false,
    Env: []
  });
  assertNotEquals(exec.id, null);
  await exec.start({});
  await container.kill();
  await container.rm();
});

Deno.test("test inspect an exec instance", async () => {
  const container = await docker.containers.create(cname("inspect-exec"), {
    Image: "ubuntu",
    Cmd: ["sleep", "500"],
    StopTimeout: 10,
  });

  await container.start();

  const exec = await container.exec({
    Cmd: ["echo", "Hello, World!"],
    AttachStdin: false,
    AttachStdout: false,
    AttachStderr: false,
    DetachKeys: "",
    Tty: false,
    Env: []
  });
  assertNotEquals(exec.id, null);
  await exec.start({});
  const execInfo = await exec.inspect();
  assertNotEquals(execInfo, null);
  assertEquals(execInfo.ContainerID, container.id);
  await container.kill();
  await container.rm();
});

Deno.test("test export a container", async () => {
  const container = await docker.containers.create(cname("export"), {
    Image: "alpine",
    Cmd: ["true"],
    StopTimeout: 10,
  });
  assertNotEquals(container.id, null);
  const tarStream = await container.export();
  assertNotEquals(tarStream, null);
  await Deno.mkdir("temp");
  await Deno.writeFile("temp/alpine.tar", tarStream);
  const fileInfo = await Deno.lstat("temp/alpine.tar")
  assert(fileInfo.isFile);
  await Deno.remove("temp/alpine.tar");
  await Deno.remove("temp");
  await container.rm();
});


Deno.test("test export a container as a file", async () => {
  const container = await docker.containers.create(cname("export"), {
    Image: "alpine",
    Cmd: ["true"],
    StopTimeout: 10,
  });
  assertNotEquals(container.id, null);
  await Deno.mkdir("temp");
  await container.exportAsFile("temp/alpine.tar");
  const fileInfo = await Deno.lstat("temp/alpine.tar")
  assert(fileInfo.isFile);
  await Deno.remove("temp/alpine.tar");
  await Deno.remove("temp");
  await container.rm();
});

