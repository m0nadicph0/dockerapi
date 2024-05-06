import { assertEquals, assertNotEquals } from "std/assert/mod.ts";
import { Docker } from "../mod.ts";

const docker = new Docker("/var/run/docker.sock");

Deno.test("test get system information", async () => {
  const sysInfo = await docker.system.info();
  assertNotEquals(sysInfo, null);
});

Deno.test("test get version", async () => {
  const version = await docker.system.version();
  assertNotEquals(version, null);
  assertNotEquals(version.Version, null);
});

Deno.test("test ping", async () => {
  const pingResponse = await docker.system.ping();
  assertEquals(pingResponse, "OK");
});

Deno.test("test ping head", async () => {
  const pingResponse = await docker.system.pingHead();
  assertEquals(pingResponse, "OK");
});

Deno.test("test get data usage information", async () => {
});
