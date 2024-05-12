import { DockerClient } from "./client.ts";
import {
  ContainerInfo,
  ContainerListInfo,
  ContainerStats,
  ContainerUpdateRequest,
  CreateContainerRequest,
  CreateContainerResponse,
  FSChanges,
  ProcessInfo,
  WaitContainerResponse,
} from "./types/container.ts";

export class Container {
  client: DockerClient;
  id?: string;

  constructor(client: DockerClient) {
    this.client = client;
  }

  async create(
    containerName: string,
    request: CreateContainerRequest,
  ): Promise<Container> {
    const res = await this.client.request(
      "POST",
      "/containers/create",
      JSON.stringify(request),
      new URLSearchParams({ "name": containerName }),
    );

    switch (res.status.valueOf()) {
      case 201: {
        const container = new Container(this.client);
        const responseBody = await JSON.parse(res.body) as CreateContainerResponse;
        container.id = responseBody.Id!;
        return container;
      }
      case 400:
        throw new Error("Bad parameter");
      case 404:
        throw new Error("No such image");
      case 409:
        throw new Error("Conflict");
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }

  }

  async start(detachKeys: string = "") {
    if (this.id == null) {
      throw new Error("Container not created.");
    }
    const res = await this.client.request(
      "POST",
      `/containers/${this.id}/start`,
      JSON.stringify({}),
      new URLSearchParams({ "detachKeys": detachKeys }),
    );


    switch (res.status.valueOf()) {
      case 204:
        return;
      case 304:
        throw new Error("Container already started");
      case 404:
        throw new Error("No such container");
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  async stop(wait: number = 0) {
    if (this.id == null) {
      throw new Error("Container not created.");
    }
    const res = await this.client.request(
      "POST",
      `/containers/${this.id}/stop`,
      JSON.stringify({}),
      new URLSearchParams({ "t": wait.toString() }),
    );

    switch (res.status.valueOf()) {
      case 204:
        return;
      case 304:
        throw new Error("container already stopped");
      case 404:
        throw new Error("no such container");
      case 500:
        throw new Error("server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  async rm(v: boolean = false, force: boolean = false, link: boolean = false) {
    if (this.id == null) {
      throw new Error("Container not created.");
    }

    const res = await this.client.request(
      "DELETE",
      `/containers/${this.id}`,
      JSON.stringify({}),
      new URLSearchParams({
        "v": v.toString(),
        "force": force.toString(),
        "link": link.toString(),
      }),
    );

    switch (res.status.valueOf()) {
      case 204:
        return;
      case 400:
        throw new Error("bad parameter");
      case 404:
        throw new Error("no such container");
      case 409:
        throw new Error("conflict");
      case 500:
        throw new Error("server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  async rename(name: string) {
    if (this.id == null) {
      throw new Error("Container not created.");
    }

    const res = await this.client.request(
      "POST",
      `/containers/${this.id}/rename`,
      JSON.stringify({}),
      new URLSearchParams({ "name": name }),
    );

    switch (res.status.valueOf()) {
      case 204:
        return;
      case 404:
        throw new Error("no such container");
      case 409:
        throw new Error("name already in use");
      case 500:
        throw new Error("server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  async kill(signal: string = "SIGKILL") {
    if (this.id == null) {
      throw new Error("Container not created.");
    }
    const res = await this.client.request(
      "POST",
      `/containers/${this.id}/kill`,
      JSON.stringify({}),
      new URLSearchParams({ "signal": signal }),
    );

    switch (res.status.valueOf()) {
      case 204:
        return;
      case 404:
        throw new Error("no such container");
      case 409:
        throw new Error("container is not running");
      case 500:
        throw new Error("server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  async pause() {
    if (this.id == null) {
      throw new Error("Container not created.");
    }
    const res = await this.client.request(
      "POST",
      `/containers/${this.id}/pause`,
      JSON.stringify({}),
      new URLSearchParams({}),
    );

    switch (res.status.valueOf()) {
      case 204:
        return;
      case 404:
        throw new Error("no such container");
      case 409:
        throw new Error("container is not running");
      case 500:
        throw new Error("server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  async unpause() {
    if (this.id == null) {
      throw new Error("Container not created.");
    }
    const res = await this.client.request(
      "POST",
      `/containers/${this.id}/unpause`,
      JSON.stringify({}),
      new URLSearchParams({}),
    );

    switch (res.status.valueOf()) {
      case 204:
        return;
      case 404:
        throw new Error("no such container");
      case 500:
        throw new Error("server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  async inspect(size: boolean = false): Promise<ContainerInfo> {
    if (this.id == null) {
      throw new Error("Container not created.");
    }
    const res = await this.client.request(
      "GET",
      `/containers/${this.id}/json`,
      "",
      new URLSearchParams({ "size": size.toString() }),
    );

    switch (res.status.valueOf()) {
      case 200:
        return await JSON.parse(res.body) as ContainerInfo;
      case 404:
        throw new Error("no such container");
      case 500:
        throw new Error("server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  async list(
    all?: boolean,
    limit?: number,
    size?: boolean,
    filters?: string,
  ): Promise<Container[]> {
    const res = await this.client.request(
      "GET",
      `/containers/json`,
      "",
      new URLSearchParams({
        "all": all ? "true" : "",
        "limit": limit ? limit.toString() : "",
        "size": size ? size.toString() : "",
        "filters": filters ? filters.toString() : "",
      }),
    );

    switch (res.status.valueOf()) {
      case 200: {
        const responseData = await JSON.parse(res.body) as ContainerListInfo[];
        return responseData.map((info) => {
          const container = new Container(this.client);
          container.id = info.Id;
          return container;
        });
      }
      case 400:
        throw new Error("bad parameter");
      case 500:
        throw new Error("server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  async processes(args: string = "-ef"): Promise<ProcessInfo> {
    const res = await this.client.request(
      "GET",
      `/containers/${this.id}/top`,
      "",
      new URLSearchParams({
        "ps_args": args,
      }),
    );

    switch (res.status.valueOf()) {
      case 200:
        return await JSON.parse(res.body) as ProcessInfo;
      case 404:
        throw new Error("no such container");
      case 500:
        throw new Error("server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  async fsChanges(): Promise<FSChanges[]> {
    if (this.id == null) {
      throw new Error("Container not created.");
    }
    const res = await this.client.request(
      "GET",
      `/containers/${this.id}/changes`,
      "",
      new URLSearchParams({}),
    );
    switch (res.status.valueOf()) {
      case 200:
        return await JSON.parse(res.body) as FSChanges[];
      case 404:
        throw new Error("no such container");
      case 500:
        throw new Error("server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  async update(request: ContainerUpdateRequest): Promise<Container> {
    if (this.id == null) {
      throw new Error("Container not created.");
    }
    const res = await this.client.request(
      "POST",
      `/containers/${this.id}/update`,
      JSON.stringify(request),
      new URLSearchParams({}),
    );
    switch (res.status.valueOf()) {
      case 200:
        return this;
      case 404:
        throw new Error("no such container");
      case 500:
        throw new Error("server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  async wait(
    condition: string = "not-running",
  ): Promise<WaitContainerResponse> {
    if (this.id == null) {
      throw new Error("Container not created.");
    }

    const res = await this.client.request(
      "POST",
      `/containers/${this.id}/wait`,
      "",
      new URLSearchParams({ "condition": condition }),
    );

    switch (res.status.valueOf()) {
      case 200:
        return await JSON.parse(res.body) as WaitContainerResponse;
      case 400:
        throw new Error("bad parameter");
      case 404:
        throw new Error("no such container");
      case 500:
        throw new Error("server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  async stats(stream?: boolean): Promise<ContainerStats> {
    if (this.id == null) {
      throw new Error("Container not created.");
    }

    const res = await this.client.request(
      "GET",
      `/containers/${this.id}/stats`,
      "",
      new URLSearchParams({ "stream": stream ? stream.toString() : "" }),
    );

    switch (res.status.valueOf()) {
      case 200:
        return await JSON.parse(res.body) as ContainerStats;
      case 404:
        throw new Error("no such container");
      case 500:
        throw new Error("server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }
}
