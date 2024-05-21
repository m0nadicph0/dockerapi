import { DockerClient } from "./client.ts";
import { SystemInformation, Version } from "./types/system.ts";

/**
 * Represents a group of system api.
 */
export class System {
  client: DockerClient;

  constructor(client: DockerClient) {
    this.client = client;
  }

  /**
   * Retrieves system information from the server.
   *
   * @returns {Promise<SystemInformation>} A promise that resolves to the system information object.
   * @throws {Error} If the server returns a 500 error or an unexpected status code.
   */
  async info(): Promise<SystemInformation> {
    const res = await this.client.request(
      "GET",
      "/info",
      "",
      new URLSearchParams({}),
    );

    switch (res.status.valueOf()) {
      case 200:
        return await res.json() as SystemInformation;
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  /**
   * Retrieves the version information from the server.
   * @returns A promise that resolves with the version information.
   * @throws {Error} If the server returns a 500 error or an unexpected status code.
   */
  async version(): Promise<Version> {
    const res = await this.client.request(
      "GET",
      "/version",
      "",
      new URLSearchParams({}),
    );

    switch (res.status.valueOf()) {
      case 200:
        return await res.json() as Version;
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  /**
   * Sends a ping request to the server.
   *
   * @returns {Promise<string>} - A Promise that resolves with the ping response.
   * @throws {Error} - If the server returns a status code other than 200 or 500.
   */
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

  /**
   * Makes a HEAD request to the "/_ping" endpoint.
   *
   * @returns {Promise<string>} - A promise that resolves to the response status message.
   * @throws {Error} - If the response status code is 500 (Server Error) or any other unexpected status code.
   */
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
