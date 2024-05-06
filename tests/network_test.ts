import { assert, assertEquals, assertNotEquals } from "std/assert/mod.ts";
import { Docker } from "../mod.ts";
import { cname } from "./helper.ts";

const docker = new Docker("/var/run/docker.sock");

Deno.test("test create network", async () => {
  const network = await docker.networks.create({
    Name: cname("create-net"),
  });
  assertNotEquals(network.id, null);
  await network.rm();
});

Deno.test("test remove network", async () => {
  const network = await docker.networks.create({
    Name: cname("rm-net"),
  });
  assertNotEquals(network.id, null);
  await network.rm();
});

Deno.test("test inspect a network", async () => {
  const name = cname("inspect-net");
  const network = await docker.networks.create({
    Name: name,
  });
  assertNotEquals(network.id, null);
  const info = await network.inspect();
  assertNotEquals(info, null);
  assertEquals(info.Id, network.id);
  assertEquals(info.Name, name);
  await network.rm();
});

Deno.test("test connect a container to a network", async () => {
  const container = await docker.containers.create(cname("connect-net"), {
    Image: "ubuntu",
    Cmd: ["true"],
    StopTimeout: 10,
  });
  const netName = cname("connect-net");
  const network = await docker.networks.create({
    Name: netName,
  });
  await network.connect(container);
  const info = await container.inspect();
  assertNotEquals(info.NetworkSettings.Networks[netName], undefined);
  await network.rm();
  await container.rm();
});

Deno.test("test disconnect a container from a network", async () => {
  const container = await docker.containers.create(cname("disconnect-net"), {
    Image: "ubuntu",
    Cmd: ["true"],
    StopTimeout: 10,
  });
  const netName = cname("disconnect-net");
  const network = await docker.networks.create({
    Name: netName,
  });
  await network.connect(container);
  const info = await container.inspect();
  assertNotEquals(info.NetworkSettings.Networks[netName], undefined);
  await network.disconnect(container);
  const infoAfter = await container.inspect();
  assertEquals(infoAfter.NetworkSettings.Networks[netName], undefined);
  await network.rm();
  await container.rm();
});

Deno.test("test list networks", async () => {
  const networks = await docker.networks.list();
  assert(networks.length > 1);
});

Deno.test("test delete unused networks", async () => {
  await docker.networks.create({ Name: cname("prune-net") });
  const networksBefore = await docker.networks.list();
  await docker.networks.prune();
  const networksAfter = await docker.networks.list();
  assert(networksBefore.length > networksAfter.length);
});
