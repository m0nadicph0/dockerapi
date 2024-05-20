export interface CreateContainerRequest {
  Image: string;
  Cmd: string[];
  StopTimeout: number;
}

export interface CreateContainerResponse {
  Id?: string;
  Warning?: string;
}

export interface ContainerUpdateRequest {
  BlkioWeight?: number;
  CpuShares?: number;
  CpuPeriod?: number;
  CpuQuota?: number;
  CpuRealtimePeriod?: number;
  CpuRealtimeRuntime?: number;
  CpusetCpus?: string;
  CpusetMems?: string;
  Memory?: number;
  MemorySwap?: number;
  MemoryReservation?: number;
  KernelMemory?: number;
  RestartPolicy?: {
    MaximumRetryCount?: number;
    Name?: string;
  };
}

export interface ContainerUpdateResponse {
  Warnings?: string[];
  message?: string;
}

export interface ContainerInfo {
  AppArmorProfile: string;
  Args: string[];
  Config: {
    AttachStderr: boolean;
    AttachStdin: boolean;
    AttachStdout: boolean;
    Cmd: string[];
    Domainname: string;
    Env: string[];
    Healthcheck: {
      Test: string[];
    };
    Hostname: string;
    Image: string;
    Labels: {
      [key: string]: string;
    };
    MacAddress: string;
    NetworkDisabled: boolean;
    OpenStdin: boolean;
    StdinOnce: boolean;
    Tty: boolean;
    User: string;
    Volumes: {
      [key: string]: Record<string | number | symbol, never>;
    };
    WorkingDir: string;
    StopSignal: string;
    StopTimeout: number;
  };
  Created: string;
  Driver: string;
  ExecIDs: string[];
  HostConfig: {
    MaximumIOps: number;
    MaximumIOBps: number;
    BlkioWeight: number;
    BlkioWeightDevice: Record<string | number | symbol, never>[];
    BlkioDeviceReadBps: Record<string | number | symbol, never>[];
    BlkioDeviceWriteBps: Record<string | number | symbol, never>[];
    BlkioDeviceReadIOps: Record<string | number | symbol, never>[];
    BlkioDeviceWriteIOps: Record<string | number | symbol, never>[];
    ContainerIDFile: string;
    CpusetCpus: string;
    CpusetMems: string;
    CpuPercent: number;
    CpuShares: number;
    CpuPeriod: number;
    CpuRealtimePeriod: number;
    CpuRealtimeRuntime: number;
    Devices: any[];
    DeviceRequests: {
      Driver: string;
      Count: number;
      DeviceIDs: string[];
      Capabilities: string[][];
      Options: {
        [key: string]: string;
      };
    }[];
    IpcMode: string;
    Memory: number;
    MemorySwap: number;
    MemoryReservation: number;
    KernelMemory: number;
    OomKillDisable: boolean;
    OomScoreAdj: number;
    NetworkMode: string;
    PidMode: string;
    PortBindings: Record<string | number | symbol, never>;
    Privileged: boolean;
    ReadonlyRootfs: boolean;
    PublishAllPorts: boolean;
    RestartPolicy: {
      MaximumRetryCount: number;
      Name: string;
    };
    LogConfig: {
      Type: string;
    };
    Sysctls: {
      [key: string]: string;
    };
    Ulimits: Record<string | number | symbol, never>[];
    VolumeDriver: string;
    ShmSize: number;
  };
  HostnamePath: string;
  HostsPath: string;
  LogPath: string;
  Id: string;
  Image: string;
  MountLabel: string;
  Name: string;
  NetworkSettings: {
    Bridge: string;
    SandboxID: string;
    HairpinMode: boolean;
    LinkLocalIPv6Address: string;
    LinkLocalIPv6PrefixLen: number;
    SandboxKey: string;
    EndpointID: string;
    Gateway: string;
    GlobalIPv6Address: string;
    GlobalIPv6PrefixLen: number;
    IPAddress: string;
    IPPrefixLen: number;
    IPv6Gateway: string;
    MacAddress: string;
    Networks: {
      [key: string]: {
        NetworkID: string;
        EndpointID: string;
        Gateway: string;
        IPAddress: string;
        IPPrefixLen: number;
        IPv6Gateway: string;
        GlobalIPv6Address: string;
        GlobalIPv6PrefixLen: number;
        MacAddress: string;
      };
    };
  };
  Path: string;
  ProcessLabel: string;
  ResolvConfPath: string;
  RestartCount: number;
  State: {
    Error: string;
    ExitCode: number;
    FinishedAt: string;
    Health: {
      Status: string;
      FailingStreak: number;
      Log: {
        Start: string;
        End: string;
        ExitCode: number;
        Output: string;
      }[];
    };
    OOMKilled: boolean;
    Dead: boolean;
    Paused: boolean;
    Pid: number;
    Restarting: boolean;
    Running: boolean;
    StartedAt: string;
    Status: string;
  };
  Mounts: {
    Name: string;
    Source: string;
    Destination: string;
    Driver: string;
    Mode: string;
    RW: boolean;
    Propagation: string;
  }[];
}

export interface ContainerListInfo {
  Id: string;
  Names: string[];
  Image: string;
  ImageID: string;
  Command: string;
  Created: number;
  State: string;
  Status: string;
  Ports: {
    PrivatePort: number;
    PublicPort: number;
    Type: string;
  }[];
  Labels: {
    [key: string]: string;
  };
  SizeRw: number;
  SizeRootFs: number;
  HostConfig: {
    NetworkMode: string;
  };
  NetworkSettings: {
    Networks: {
      [key: string]: {
        NetworkID: string;
        EndpointID: string;
        Gateway: string;
        IPAddress: string;
        IPPrefixLen: number;
        IPv6Gateway: string;
        GlobalIPv6Address: string;
        GlobalIPv6PrefixLen: number;
        MacAddress: string;
      };
    };
  };
  Mounts: {
    Name: string;
    Source: string;
    Destination: string;
    Driver: string;
    Mode: string;
    RW: boolean;
    Propagation: string;
  }[];
}

export interface ProcessInfo {
  Titles: string[];
  Processes: string[][];
}

export enum Kind {
  Modified,
  Added,
  Deleted,
}

export interface FSChanges {
  Path: string;
  Kind: Kind;
}

export interface WaitContainerResponse {
  StatusCode: number;
  Error: {
    Message: string;
  };
}

export interface ContainerStats {
  read: string;
  pids_stats: {
    current: number;
  };
  networks: {
    [key: string]: {
      rx_bytes: number;
      rx_dropped: number;
      rx_errors: number;
      rx_packets: number;
      tx_bytes: number;
      tx_dropped: number;
      tx_errors: number;
      tx_packets: number;
    };
  };
  memory_stats: {
    stats: {
      total_pgmajfault: number;
      cache: number;
      mapped_file: number;
      total_inactive_file: number;
      pgpgout: number;
      rss: number;
      total_mapped_file: number;
      writeback: number;
      unevictable: number;
      pgpgin: number;
      total_unevictable: number;
      pgmajfault: number;
      total_rss: number;
      total_rss_huge: number;
      total_writeback: number;
      total_inactive_anon: number;
      rss_huge: number;
      hierarchical_memory_limit: number;
      total_pgfault: number;
      total_active_file: number;
      active_anon: number;
      total_active_anon: number;
      total_pgpgout: number;
      total_cache: number;
      inactive_anon: number;
      active_file: number;
      pgfault: number;
      inactive_file: number;
      total_pgpgin: number;
    };
    max_usage: number;
    usage: number;
    failcnt: number;
    limit: number;
  };
  blkio_stats: any;
  cpu_stats: {
    cpu_usage: {
      percpu_usage: number[];
      usage_in_usermode: number;
      total_usage: number;
      usage_in_kernelmode: number;
    };
    system_cpu_usage: number;
    online_cpus: number;
    throttling_data: {
      periods: number;
      throttled_periods: number;
      throttled_time: number;
    };
  };
  precpu_stats: {
    cpu_usage: {
      percpu_usage: number[];
      usage_in_usermode: number;
      total_usage: number;
      usage_in_kernelmode: number;
    };
    system_cpu_usage: number;
    online_cpus: number;
    throttling_data: {
      periods: number;
      throttled_periods: number;
      throttled_time: number;
    };
  };
}

export interface CreateExecRequest {
  AttachStdin: boolean;
  AttachStdout: boolean;
  AttachStderr: boolean;
  DetachKeys: string;
  Tty: boolean;
  Cmd: string[];
  Env: string[];
}

export interface CreateExecResponse {
  Id: string;
}