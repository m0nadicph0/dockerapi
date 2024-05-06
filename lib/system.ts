import { DockerClient } from "./client.ts";
import { SystemInformation, Version } from "./types/system.ts";

export class System {
  client: DockerClient;

  constructor(client: DockerClient) {
    this.client = client;
  }

  async info(): Promise<SystemInformation> {
    const res = await this.client.request(
      "GET",
      "/info",
      "",
      new URLSearchParams({}),
    );

    switch (res.status.valueOf()) {
      case 200:
        return JSON.parse(res.body) as SystemInformation;
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  async version(): Promise<Version> {
    const res = await this.client.request(
      "GET",
      "/version",
      "",
      new URLSearchParams({}),
    );

    switch (res.status.valueOf()) {
      case 200:
        return JSON.parse(res.body) as Version;
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  async ping(): Promise<string> {
    const res = await this.client.request(
      "GET",
      "/_ping",
      "",
      new URLSearchParams({}),
    );

    switch (res.status.valueOf()) {
      case 200:
        return "OK";
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  async pingHead(): Promise<string> {
    const res = await this.client.request(
      "HEAD",
      "/_ping",
      "",
      new URLSearchParams({}),
    );

    switch (res.status.valueOf()) {
      case 200:
        return "OK";
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }
}
