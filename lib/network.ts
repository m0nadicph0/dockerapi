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

export class Network {
  client: DockerClient;
  id?: string;

  constructor(client: DockerClient) {
    this.client = client;
  }

  async create(opt: CreateNetworkRequest): Promise<Network> {
    const res = await this.client.request(
      "POST",
      "/networks/create",
      JSON.stringify(opt),
      new URLSearchParams({}),
    );

    switch (res.status.valueOf()) {
      case 201: {
        const payload: CreateNetworkResponse = JSON.parse(res.body);
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
        return JSON.parse(res.body) as NetworkInfo;
      case 404:
        throw new Error("No such network");
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

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
      case 404:
        throw new Error("No such network");
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

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
        return JSON.parse(res.body) as NetworkListItem[];
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

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
