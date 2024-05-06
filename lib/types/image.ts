export interface ImageListInfo {
  Id: string;
  ParentId: string;
  RepoTags: string[];
  RepoDigests: string[];
  Created: string;
  Size: number;
  SharedSize: number;
  VirtualSize: number;
  Labels: {
    [key: string]: string;
  };
  Containers: number;
}

export interface ImageInfo {
  Id: string;
  RepoTags: string[];
  RepoDigests: string[];
  Parent: string;
  Comment: string;
  Created: string;
  Container: string;
  ContainerConfig: ContainerConfig;
  DockerVersion: string;
  Author: string;
  Config: ContainerConfig;
  Architecture: string;
  Variant: string;
  Os: string;
  OsVersion: string;
  Size: number;
  VirtualSize: number;
  GraphDriver: GraphDriver;
  RootFS: RootFS;
  Metadata: Metadata;
}

interface ContainerConfig {
  Hostname: string;
  Domainname: string;
  User: string;
  AttachStdin: boolean;
  AttachStdout: boolean;
  AttachStderr: boolean;
  ExposedPorts: { [key: string]: {} };
  Tty: boolean;
  OpenStdin: boolean;
  StdinOnce: boolean;
  Env: string[];
  Cmd: string[];
  Healthcheck: Healthcheck;
  ArgsEscaped: boolean;
  Image: string;
  Volumes: { [key: string]: {} };
  WorkingDir: string;
  Entrypoint: any[];
  NetworkDisabled: boolean;
  MacAddress: string;
  OnBuild: any[];
  Labels: { [key: string]: string };
  StopSignal: string;
  StopTimeout: number;
  Shell: string[];
}

interface Healthcheck {
  Test: string[];
  Interval: number;
  Timeout: number;
  Retries: number;
  StartPeriod: number;
}

interface GraphDriver {
  Name: string;
  Data: {
    MergedDir: string;
    UpperDir: string;
    WorkDir: string;
  };
}

interface RootFS {
  Type: string;
  Layers: string[];
}

interface Metadata {
  LastTagTime: string;
}

export interface ImageHistoryItem {
  Id: string;
  Created: number;
  CreatedBy: string;
  Tags: string[];
  Size: number;
  Comment: string;
}

export type RmResult = { "Untagged": string } | { "Deleted": string };

export interface SearchResultItem {
  description: string;
  is_official: boolean;
  is_automated: boolean;
  name: string;
  star_count: number;
}

export interface CommitContainerConfig {
  Hostname?: string;
  Domainname?: string;
  User?: string;
  AttachStdin?: boolean;
  AttachStdout?: boolean;
  AttachStderr?: boolean;
  ExposedPorts?: {
    [key: string]: Record<string | number | symbol, never>;
  };
  Tty?: boolean;
  OpenStdin?: boolean;
  StdinOnce?: boolean;
  Env?: string[];
  Cmd?: string[];
  Healthcheck?: {
    Test?: string[];
    Interval?: number;
    Timeout?: number;
    Retries?: number;
    StartPeriod?: number;
  };
  ArgsEscaped?: boolean;
  Image?: string;
  Volumes?: {
    [key: string]: Record<string | number | symbol, never>;
  };
  WorkingDir?: string;
  Entrypoint?: string[];
  NetworkDisabled?: boolean;
  MacAddress?: string;
  OnBuild?: string[];
  Labels?: {
    [key: string]: string;
  };
  StopSignal?: string;
  StopTimeout?: number;
  Shell?: string[];
}

export interface CommitContainerResponse {
  Id?: string;
  message?: string;
}

export interface CommitOptions {
  repo: string;
  tag: string;
  comment?: string;
  author?: string;
  pause?: boolean;
  changes?: string;
}
