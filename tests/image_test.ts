import { assert } from "std/assert/assert.ts";
import { Docker } from "../mod.ts";

import { cname } from "./helper.ts";
import { assertEquals, assertNotEquals } from "std/assert/mod.ts";

const docker = new Docker("/var/run/docker.sock");

Deno.test("test list images", async () => {
  const images = await docker.images.list();
  assert(images.length > 1);
});

Deno.test("test inspect image", async () => {
  const images = await docker.images.list();
  assert(images.length > 1);
  const image = images[0];
  const info = await image.inspect();
  assert(image.id === info.Id);
});

Deno.test("test create image", async () => {
  const image = await docker.images.create("busybox", "uclibc");
  const info = await image.inspect();
  assertEquals(info.RepoTags.length, 1);
  assertEquals(info.RepoTags[0], "busybox:uclibc");
});

Deno.test("test get image history", async () => {
  const image = await docker.images.create("busybox", "uclibc");
  const history = await image.history();
  assert(history.length > 0);
});

Deno.test("test remove image", async () => {
  const image = await docker.images.create("busybox", "uclibc");
  const res = await image.rm();
  assert(res.length > 0);
});

Deno.test("test search images", async () => {
  const result = await docker.images.search("busybox", 5);
  assert(result.length > 0);
  assert(result.length <= 5);
});

Deno.test("test create new image from a container", async () => {
  const container = await docker.containers.create(cname("commit"), {
    Image: "ubuntu",
    Cmd: ["/bin/sh", "-c", "touch file1 file2 file3 file4 file5"],
    StopTimeout: 10,
  });
  await container.start();
  const image = await docker.images.commit(container, {
    repo: "fox",
    tag: "0.0.1",
  }, {});
  assertNotEquals(image.id, null);

  await container.rm();
  await image.rm();
});
