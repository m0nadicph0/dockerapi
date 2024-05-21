import { DockerClient } from "./client.ts";
import { Container } from "./container.ts";
import {
  ConnectNetworkRequest,
  CreateNetworkRequest,
  CreateNetworkResponse,
  DisconnectNetworkRequest,
  EndpointConfig,
  NetworkInfo,
  NetworkListItem,
} from "./types/network.ts";

/**
 * Represents a Docker network.
 */
export class Network {
  client: DockerClient;
  id?: string;

  constructor(client: DockerClient) {
    this.client = client;
  }

  /**
   * Creates a network.
   *
   * @param {CreateNetworkRequest} opt - The network creation options.
   * @return {Promise<Network>} - A promise that resolves with the created network.
   * @throws {Error} - Throws an error if any of the following conditions are met:
   *   - Bad parameter (HTTP status 400)
   *   - Operation not supported for pre-defined networks (HTTP status 403)
   *   - Plugin not found (HTTP status 404)
   *   - Conflict (HTTP status 409)
   *   - Server error (HTTP status 500)
   *   - Unexpected status code (other HTTP status codes)
   */
  async create(opt: CreateNetworkRequest): Promise<Network> {
    const res = await this.client.request(
      "POST",
      "/networks/create",
      JSON.stringify(opt),
      new URLSearchParams({}),
    );

    switch (res.status.valueOf()) {
      case 201: {
        const payload: CreateNetworkResponse = await res.json();
        const network = new Network(this.client);
        network.id = payload.Id;
        return network;
      }
      case 400:
        throw new Error("bad parameter");
      case 403:
        throw new Error("Operation not supported for pre-defined networks");
      case 404:
        throw new Error("Plugin not found");
      case 409:
        throw new Error("Conflict");
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  /**
   * Deletes the network.
   *
   * @throws {Error} If the network is not created.
   * @throws {Error} If the operation is not supported for pre-defined networks.
   * @throws {Error} If no such network exists.
   * @throws {Error} If a server error occurs.
   * @throws {Error} If an unexpected status code is returned.
   *
   * @returns {Promise<void>} A Promise that resolves when the network is deleted.
   */
  async rm(): Promise<void> {
    if (this.id === null) {
      throw new Error("Network not created");
    }
    const res = await this.client.request(
      "DELETE",
      `/networks/${this.id}`,
      "",
      new URLSearchParams({}),
    );

    switch (res.status.valueOf()) {
      case 204:
        return;
      case 403:
        throw new Error("Operation not supported for pre-defined networks");
      case 404:
        throw new Error("No such network");
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  /**
   * Retrieves information about the network
   * @param {boolean} [verbose] - Specifies whether to include verbose information. Default is false.
   * @param {string} [scope] - The scope of the network.
   * @returns {Promise<NetworkInfo>} - A promise that resolves with the network information.
   * @throws {Error} - If the network is not created, or if there is no such network, or if there is a server error, or if the status code is unexpected.
   */
  async inspect(verbose?: boolean, scope?: string): Promise<NetworkInfo> {
    if (this.id === null) {
      throw new Error("Network not created");
    }
    const res = await this.client.request(
      "GET",
      `/networks/${this.id}`,
      "",
      new URLSearchParams({
        "verbose": verbose ? verbose.toString() : "",
        "scope": scope ? scope : "",
      }),
    );

    switch (res.status.valueOf()) {
      case 200:
        return await res.json() as NetworkInfo;
      case 404:
        throw new Error("No such network");
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  /**
   * Connects a container to the network.
   *
   * @param {Container} container - The container to connect to the network.
   * @param {EndpointConfig} [config] - The endpoint configuration for the network connection.
   * @returns {Promise<void>} - A Promise that resolves when the container is successfully connected to the network.
   * @throws {Error} - If container is not created.
   * @throws {Error} - If network is not creates.
   * @throws {Error} - If operation not supported for swarm scoped networks.
   * @throws {Error} - If network or container not found.
   * @throws {Error} - If server returns 500 server error.
   */
  async connect(container: Container, config?: EndpointConfig): Promise<void> {
    if (this.id === null) {
      throw new Error("Network not created");
    }

    if (container.id === null) {
      throw new Error("Container not created");
    }

    const request: ConnectNetworkRequest = {
      Container: container.id ? container.id : "",
      EndpointConfig: config,
    };

    const res = await this.client.request(
      "POST",
      `/networks/${this.id}/connect`,
      JSON.stringify(request),
      new URLSearchParams({}),
    );

    switch (res.status.valueOf()) {
      case 200:
        return;
      case 403:
        throw new Error("Operation not supported for swarm scoped networks");
      case 404:
        throw new Error("No such network");
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  /**
   * Disconnects a network from a container.
   *
   * @param {Container} container - The container to disconnect.
   * @param {boolean} [force=false] - Whether to force the disconnection.
   * @throws {Error} If the network or container is not created.
   * @throws {Error} If the request fails due to a server error.
   * @throws {Error} If an unexpected status code is returned.
   */
  async disconnect(container: Container, force: boolean = false) {
    if (this.id === null) {
      throw new Error("Network not created");
    }

    if (container.id === null) {
      throw new Error("Container not created");
    }

    const request: DisconnectNetworkRequest = {
      Container: container.id ? container.id : "",
      Force: force,
    };

    const res = await this.client.request(
      "POST",
      `/networks/${this.id}/disconnect`,
      JSON.stringify(request),
      new URLSearchParams({}),
    );

    switch (res.status.valueOf()) {
      case 200:
        return;
      case 404:
        throw new Error("No such network");
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  /**
   * Returns a list of networks.
   *
   * @param {string} [filters] - Optional filters for the request.
   * @returns {Promise<NetworkListItem[]>} - A promise that resolves to an array of NetworkListItem objects.
   * @throws {Error} - If the server returns a 500 error or an unexpected status code.
   */
  async list(filters?: string): Promise<NetworkListItem[]> {
    const res = await this.client.request(
      "GET",
      "/networks",
      "",
      new URLSearchParams({
        "filters": filters ? filters : "",
      }),
    );
    switch (res.status.valueOf()) {
      case 200:
        return await res.json() as NetworkListItem[];
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  /**
   * Prunes unused docker network(s) based on the given filters.
   *
   * @param {string} filters - The filters to apply when pruning the networks. Defaults to an empty string.
   * @throws {Error} If a server error occurs or if an unexpected status code is returned.
   *
   * @returns {Promise<void>} A promise that resolves with no value upon successful pruning.
   */
  async prune(filters?: string): Promise<void> {
    const res = await this.client.request(
      "POST",
      "/networks/prune",
      "",
      new URLSearchParams({
        "filters": filters ? filters : "",
      }),
    );

    switch (res.status.valueOf()) {
      case 200:
        return;
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }
}
