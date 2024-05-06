import { DockerClient } from "./client.ts";
import {
  CreateVolumeRequest,
  CreateVolumeResponse,
  PruneVolumesResponse,
  VolumeInfo,
  VolumeList,
} from "./types/volume.ts";

export class Volume {
  client: DockerClient;
  name?: string;

  constructor(client: DockerClient) {
    this.client = client;
  }

  async create(opt: CreateVolumeRequest): Promise<Volume> {
    const res = await this.client.request(
      "POST",
      "/volumes/create",
      JSON.stringify(opt),
      new URLSearchParams({}),
    );

    switch (res.status.valueOf()) {
      case 201: {
        const data = await JSON.parse(res.body) as CreateVolumeResponse;
        const volume = new Volume(this.client);
        volume.name = data.Name;
        return volume;
      }
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  async rm(force?: boolean): Promise<void> {
    if (this.name === null) {
      throw new Error("Volume not created");
    }

    const res = await this.client.request(
      "DELETE",
      `/volumes/${this.name}`,
      "",
      new URLSearchParams({
        "force": force ? force.toString() : "",
      }),
    );

    switch (res.status.valueOf()) {
      case 204:
        return;
      case 404:
        throw new Error("No such volume or volume driver");
      case 409:
        throw new Error("Volume is in use and cannot be removed");
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  async inspect(): Promise<VolumeInfo> {
    const res = await this.client.request(
      "GET",
      `/volumes/${this.name}`,
      "",
      new URLSearchParams({}),
    );

    switch (res.status.valueOf()) {
      case 200:
        return await JSON.parse(res.body) as VolumeInfo;
      case 404:
        throw new Error("No such volume or volume driver");
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  async list(): Promise<VolumeList> {
    const res = await this.client.request(
      "GET",
      "/volumes",
      "",
      new URLSearchParams({}),
    );

    switch (res.status.valueOf()) {
      case 200:
        return await JSON.parse(res.body) as VolumeList;
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  async prune(): Promise<PruneVolumesResponse> {
    const res = await this.client.request(
      "POST",
      "/v1.40/volumes/prune",
      "",
      new URLSearchParams({}),
    );

    switch (res.status.valueOf()) {
      case 200:
        return JSON.parse(res.body) as PruneVolumesResponse;
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }
}
