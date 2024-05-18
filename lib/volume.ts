import { DockerClient } from "./client.ts";
import {
  CreateVolumeRequest,
  CreateVolumeResponse,
  PruneVolumesResponse,
  VolumeInfo,
  VolumeList,
} from "./types/volume.ts";

/**
 * Represents a Docker Volume.
 */
export class Volume {
  client: DockerClient;
  name?: string;

  constructor(client: DockerClient) {
    this.client = client;
  }

  /**
   * Creates a volume with the given options.
   * @param {CreateVolumeRequest} opt - The options used to create the volume.
   * @returns {Promise<Volume>} A promise that resolves with the created volume.
   * @throws {Error} If the server returns a status code 500.
   */
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

  /**
   * Instruct the driver to remove the volume.
   * @param {boolean} [force] - Optional. If true, forces removal of the volume even if it is in use.
   * @returns {Promise<void>} - Promise that resolves when the volume is successfully removed.
   * @throws {Error} - Throws an error if no such volume or volume driver exists.
   * @throws {Error} - Throws an error if the volume is in use and cannot be removed.
   * @throws {Error} - Throws an error if the server returned 500 status code.
   */
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

  /**
   * Returns information about the volume.
   *
   * @returns {Promise<VolumeInfo>} A promise that resolves with the volume information.
   * @throws {Error} If the volume or volume driver does not exist, or if there is a server error.
   */
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

  /**
   * Retrieves a list of volumes.
   *
   * @async
   * @function list
   * @returns {Promise<VolumeList>} - A promise that resolves with the list of volumes.
   * @throws {Error} - If the server responds with a 500 error or an unexpected status code.
   */
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

  /**
   * Prunes unused volumes.
   *
   * @returns {Promise<PruneVolumesResponse>} A promise that resolves with a PruneVolumesResponse object.
   * @throws {Error} If a server error occurs or an unexpected status code is returned.
   */
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
