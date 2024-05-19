import { Docker } from "../../mod.ts";

const docker = new Docker("/var/run/docker.sock");

const volumes = await docker.volumes.list();

console.log(
  `%cDRIVER\tVOLUME NAME\tCREATED AT\tSCOPE\tMOUNT POINT`,
  "color: red",
);
volumes.Volumes.forEach((volume) => {
  console.log(
    `${volume.Driver}\t${volume.Name}\t${volume.CreatedAt}\t${volume.Scope}\t${volume.Mountpoint}`,
  );
});
