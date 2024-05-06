import { DockerClient } from "./lib/client.ts";
import { Container } from "./lib/container.ts";
import { Image } from "./lib/image.ts";
import { Network } from "./lib/network.ts";
import { System } from "./lib/system.ts";
import { Volume } from "./lib/volume.ts";

export class Docker {
  containers: Container;
  images: Image;
  networks: Network;
  volumes: Volume;
  system: System;
  constructor(path: string) {
    const client = new DockerClient(path);
    this.containers = new Container(client);
    this.images = new Image(client);
    this.networks = new Network(client);
    this.volumes = new Volume(client);
    this.system = new System(client);
  }
}
