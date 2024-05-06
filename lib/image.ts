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

export class Image {
  client: DockerClient;
  id?: string;
  size?: number;
  tags?: string[];

  constructor(client: DockerClient) {
    this.client = client;
  }

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
        const responseData = await JSON.parse(res.body) as ImageListInfo[];
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
        return JSON.parse(res.body) as ImageInfo;
      case 404:
        throw new Error("No such image");
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

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
        return JSON.parse(res.body) as ImageHistoryItem[];
      case 404:
        throw new Error("No such image");
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

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
        return JSON.parse(res.body) as RmResult[];
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
        return JSON.parse(res.body) as SearchResultItem[];
      case 500:
        throw new Error("Server error");
      default:
        throw new Error(`Unexpected status code: ${res.status}`);
    }
  }

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
        const respBody = await JSON.parse(res.body);
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
}
