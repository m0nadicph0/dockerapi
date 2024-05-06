export interface CreateVolumeRequest {
  Name: string;
  Driver?: string;
  DriverOpts?: {
    device: string;
    o: string;
    type: string;
  };
  Labels?: {
    [key: string]: string;
  };
}

interface UsageData {
  Size: number;
  RefCount: number;
}

export interface CreateVolumeResponse {
  Name: string;
  Driver: string;
  Mountpoint: string;
  CreatedAt: string;
  Status: {
    [key: string]: string;
  };
  Labels: {
    [key: string]: string;
  };
  Scope: string;
  Options: {
    [key: string]: string;
  };
  UsageData: UsageData;
}

export interface VolumeInfo {
  Name: string;
  Driver: string;
  Mountpoint: string;
  CreatedAt: string;
  Status: {
    [key: string]: string;
  };
  Labels: {
    [key: string]: string;
  };
  Scope: string;
  Options: {
    [key: string]: string;
  };
  UsageData: UsageData;
}

interface Volume {
  Name: string;
  Driver: string;
  Mountpoint: string;
  CreatedAt: string;
  Status: {
    [key: string]: string;
  };
  Labels: {
    [key: string]: string;
  };
  Scope: string;
  Options: {
    [key: string]: string;
  };
  UsageData: UsageData;
}

export interface VolumeList {
  Volumes: Volume[];
  Warnings: string[];
}

export interface PruneVolumesResponse {
  VolumesDeleted: string[];
  SpaceReclaimed: number;
}
