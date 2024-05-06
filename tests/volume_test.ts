import { Docker } from "../mod.ts";

import { cname } from "./helper.ts";
import { assert, assertEquals, assertNotEquals } from "std/assert/mod.ts";

const docker = new Docker("/var/run/docker.sock");

Deno.test("test create volume", async () => {
  const volume = await docker.volumes.create({
    Name: cname("create-volume"),
  });
  assertNotEquals(volume.name, null);
  await volume.rm();
});

Deno.test("test remove volume", async () => {
  const volume = await docker.volumes.create({
    Name: cname("rm-volume"),
  });
  assertNotEquals(volume.name, null);
  await volume.rm();
});

Deno.test("test inspect volume", async () => {
  const name = cname("inspect-volume");
  const volume = await docker.volumes.create({
    Name: name,
  });
  assertNotEquals(volume.name, null);
  const info = await volume.inspect();
  assertEquals(info.Name, name);
  await volume.rm();
});

Deno.test("test list volumes", async () => {
  const volume = await docker.volumes.create({
    Name: cname("list-volume"),
  });
  assertNotEquals(volume.name, null);
  const volumeList = await docker.volumes.list();
  assert(volumeList.Volumes.length > 0);
  await volume.rm();
});

Deno.test("test delete unused volumes", async () => {
  await docker.volumes.create({
    Name: cname("prune-volume"),
  });
  const volumesBefore = await docker.volumes.list();
  const result = await docker.volumes.prune();
  assert(result.VolumesDeleted.length > 0);
  const volumesAfter = await docker.volumes.list();
  assert(volumesBefore.Volumes.length > volumesAfter.Volumes.length);
});
