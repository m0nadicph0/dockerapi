export interface SystemInformation {
  ID: string;
  Containers: number;
  ContainersRunning: number;
  ContainersPaused: number;
  ContainersStopped: number;
  Images: number;
  Driver: string;
  DriverStatus: [string, string][];
  DockerRootDir: string;
  SystemStatus: [string, string][];
  Plugins: {
    Volume: string[];
    Network: string[];
    Authorization: string[];
    Log: string[];
  };
  MemoryLimit: boolean;
  SwapLimit: boolean;
  KernelMemory: boolean;
  KernelMemoryTCP: boolean;
  CpuCfsPeriod: boolean;
  CpuCfsQuota: boolean;
  CPUShares: boolean;
  CPUSet: boolean;
  PidsLimit: boolean;
  OomKillDisable: boolean;
  IPv4Forwarding: boolean;
  BridgeNfIptables: boolean;
  BridgeNfIp6tables: boolean;
  Debug: boolean;
  NFd: number;
  NGoroutines: number;
  SystemTime: string;
  LoggingDriver: string;
  CgroupDriver: string;
  NEventsListener: number;
  KernelVersion: string;
  OperatingSystem: string;
  OSType: string;
  Architecture: string;
  NCPU: number;
  MemTotal: number;
  IndexServerAddress: string;
  Labels: string[];
  ExperimentalBuild: boolean;
  ServerVersion: string;
  ClusterStore: string;
  ClusterAdvertise: string;
  ProductLicense: string;
  Warnings: string[];
}

interface Component {
  Name: string;
  Version: string;
  Details: object;
}

interface Platform {
  Name: string;
}

export interface Version {
  Platform: Platform;
  Components: Component[];
  Version: string;
  ApiVersion: string;
  MinAPIVersion: string;
  GitCommit: string;
  GoVersion: string;
  Os: string;
  Arch: string;
  KernelVersion: string;
  Experimental: boolean;
  BuildTime: string;
}
