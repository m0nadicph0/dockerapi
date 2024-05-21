import { DockerClient } from "./client.ts";
import {
  CommitContainerConfig,
  CommitOptions,
  ImageHistoryItem,
  ImageInfo,
  ImageListInfo,
  RmResult,
  SearchResultItem,
} from "./types/image.ts";
import { Container } from "./container.ts";

/**
 * Represents a Docker image.
 */
export class Image {
  client: DockerClient;
  id?: string;
  size?: number;
  tags?: string[];

  constructor(client: DockerClient) {
    this.client = client;
  }

  /**
   * Retrieves a list of images.
   *
   * @param {boolean} [all=false] - Show all images. Only images from a final layer (no children) are shown by default.
   * @param {string} [filters=""] - Specifies filters to apply when retrieving the images. Defaults to an empty string.
   * @param {boolean} [digest=false] - Show digest information as a RepoDigests field on each image. Default is false.
   * @returns {Promise<Image[]>} - A promise that resolves to an array of Image objects representing the retrieved images.
   * @throws {Error} - If the server returns a status code other than 200 or 500, an error will be thrown.
   *                  If the server returns a status code of 500, a "Server error" error will be thrown.
   *                  If the server returns an unexpected status code, an error with the status code will be thrown.
   */
  async list(
    all?: boolean,
    filters?: string,
    digest?: boolean,
  ): Promise<Image[]> {
    const res = await this.client.request(
      "GET",
      "/images/json",
      "",
      new URLSearchParams({
        "all": all ? "true" : "",
        "filters": filters ? filters.toString() : "",
        "digest": digest ? digest.toString() : "",
      }),
    );

    switch (res.status.valueOf()) {
      case 200: {
        const responseData = await res.json() as ImageListInfo[];
        return responseData.map((info) => {
          const image = new Image(this.client);
          image.id = info.Id;
          image.size = info.Size;
          image.tags = info.RepoTags;
          return image;
        });
      }
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  /**
   * Return low-level information about an image.
   * @return {Promise<ImageInfo>} A promise that resolves to the image information.
   * @throws {Error} If the image does not exist or if there is a server error.
   */
  async inspect(): Promise<ImageInfo> {
    if (this.id === null) {
      throw new Error("no such image");
    }

    const res = await this.client.request(
      "GET",
      `/images/${this.id}/json`,
      "",
      new URLSearchParams(),
    );
    switch (res.status.valueOf()) {
      case 200:
        return await res.json() as ImageInfo;
      case 404:
        throw new Error("No such image");
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  /**
   * Create an image by either pulling it from a registry or importing it.
   *
   * @param {string} from - Name of the image to pull. The name may include a tag or digest. This parameter may only be used when pulling an image. The pull is cancelled if the HTTP connection is closed.
   * @param {string} [tag="latest"] - Tag or digest. If empty when pulling an image, this causes all tags for the given image to be pulled.
   * @returns {Promise<Image>} - A promise that resolves with the created Image object.
   * @throws {Error} - If the repository does not exist or there is no read access, or if there is a server error.
   */
  async create(from: string, tag: string = "latest"): Promise<Image> {
    const res = await this.client.request(
      "POST",
      "/images/create",
      "",
      new URLSearchParams({
        "fromImage": from,
        "tag": tag,
      }),
    );

    switch (res.status.valueOf()) {
      case 200: {
        const image = new Image(this.client);
        image.id = `${from}:${tag}`;
        return image;
      }
      case 404:
        throw new Error("Repository does not exist or no read access");
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  /**
   * Return parent layers of an image.
   * @returns {Promise<ImageHistoryItem[]>} A Promise that resolves to an array of ImageHistoryItem objects representing the parent layers of the image.
   * @throws {Error} Throws an Error if there is no such image.
   * @throws {Error} Throws an Error if there is a server error.
   * @throws {Error} Throws an Error if the response status code is unexpected.
   */
  async history(): Promise<ImageHistoryItem[]> {
    if (this.id === null) {
      throw new Error("no such image");
    }
    const res = await this.client.request(
      "GET",
      `/images/${this.id}/history`,
      "",
      new URLSearchParams(),
    );
    switch (res.status.valueOf()) {
      case 200:
        return await res.json() as ImageHistoryItem[];
      case 404:
        throw new Error("No such image");
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  /**
   * Remove an image, along with any untagged parent images that were referenced by that image.
   * Images can't be removed if they have descendant images, are being used by a running container or are being used by a build.
   *
   * @throws {Error} If the image does not exist.
   * @throws {Error} If there is a conflict.
   * @throws {Error} If there is a server error.
   * @throws {Error} If the response has an unexpected status code.
   *
   * @returns {Promise<RmResult[]>} A promise that resolves to an array of RmResult objects representing the removal results.
   */
  async rm(): Promise<RmResult[]> {
    if (this.id === null) {
      throw new Error("no such image");
    }
    const res = await this.client.request(
      "DELETE",
      `/images/${this.id}`,
      "",
      new URLSearchParams(),
    );
    switch (res.status.valueOf()) {
      case 200:
        return await res.json() as RmResult[];
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

  /**
   * Search for an image on Docker Hub.
   *
   * @param {string} term - The search term.
   * @param {number} [limit=10] - The maximum number of results to return.
   * @param {string} [filters] - Optional filters to apply to the search.
   * @return {Promise<SearchResultItem[]>} - A promise that resolves to an array of search results.
   * @throws {Error} - If the server returns a 500 status code or if an unexpected status code is received.
   */
  async search(
    term: string,
    limit: number = 10,
    filters?: string,
  ): Promise<SearchResultItem[]> {
    const res = await this.client.request(
      "GET",
      "/images/search",
      "",
      new URLSearchParams({
        "term": term,
        "limit": limit.toString(),
        "filters": filters ? filters : "",
      }),
    );
    switch (res.status.valueOf()) {
      case 200:
        return await res.json() as SearchResultItem[];
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  /**
   * Commits changes made to a container and creates a new image.
   * @param {Container} container - The container to commit changes from.
   * @param {CommitOptions} opts - The options for the commit operation.
   * @param {CommitContainerConfig} config - The configuration for the new image.
   * @returns {Promise<Image>} - A promise that resolves to the newly created image.
   * @throws {Error} - If the container is not created, or if an unexpected status code is received from the server.
   */
  async commit(
    container: Container,
    opts: CommitOptions,
    config: CommitContainerConfig,
  ): Promise<Image> {
    if (container.id === null) {
      throw new Error("container not created");
    }

    const res = await this.client.request(
      "POST",
      `/commit`,
      JSON.stringify(config),
      new URLSearchParams({
        "container": container.id ? container.id : "",
        "repo": opts.repo,
        "tag": opts.tag,
      }),
    );

    switch (res.status.valueOf()) {
      case 201: {
        const image = new Image(this.client);
        const respBody = await res.json();
        image.id = respBody.Id;
        return image;
      }
      case 404:
        throw new Error("No such container");
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

  async export(): Promise<ReadableStream<Uint8Array>> {
    const res = await this.client.request(
      "GET",
      `/images/${this.id}/get`,
      "",
      new URLSearchParams(),
    );
    switch (res.status.valueOf()) {
      case 200:
        return res.body!;
      case 404:
        throw new Error("No such image");
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }
}
