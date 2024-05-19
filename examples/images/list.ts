import { Docker } from "../../mod.ts";

const docker = new Docker("/var/run/docker.sock");

const images = await docker.images.list();
if (images.length == 0) {
  console.log("%cNo images found", "color: red");
  Deno.exit(1);
}

images.forEach(async (image) => {
  const info = await image.inspect();
  image.id &&
    console.log(`ID: ${image.id.substring(0, 15)}, RepoTags: ${info.RepoTags}`);
});
