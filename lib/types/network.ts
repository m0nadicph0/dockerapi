interface IPAMConfig {
  Subnet: string;
  IPRange?: string;
  Gateway?: string;
}

interface IPAM {
  Driver: string;
  Config: IPAMConfig[];
  Options: { [key: string]: string };
}

export interface CreateNetworkRequest {
  Name: string;
  CheckDuplicate?: boolean;
  Driver?: string;
  EnableIPv6?: boolean;
  IPAM?: IPAM;
  Internal?: boolean;
  Attachable?: boolean;
  Ingress?: boolean;
  Options?: { [key: string]: string };
  Labels?: { [key: string]: string };
}

export interface CreateNetworkResponse {
  Id?: string;
  Warning?: string;
  message?: string;
}

interface ContainerInfo {
  Name: string;
  EndpointID: string;
  MacAddress: string;
  IPv4Address: string;
  IPv6Address: string;
}

export interface NetworkInfo {
  Name: string;
  Id: string;
  Created: string;
  Scope: string;
  Driver: string;
  EnableIPv6: boolean;
  IPAM: IPAM;
  Internal: boolean;
  Attachable: boolean;
  Ingress: boolean;
  Containers: { [key: string]: ContainerInfo };
  Options: { [key: string]: string };
  Labels: { [key: string]: string };
}

export interface EndpointConfig {
  IPAMConfig: IPAMConfig;
}

export interface ConnectNetworkRequest {
  Container: string;
  EndpointConfig?: EndpointConfig;
}

export interface DisconnectNetworkRequest {
  Container: string;
  Force: boolean;
}

export interface NetworkListItem {
  Name: string;
  Id: string;
  Created: string;
  Scope: string;
  Driver: string;
  EnableIPv6: boolean;
  Internal: boolean;
  Attachable: boolean;
  Ingress: boolean;
  IPAM: IPAM;
  Options: { [key: string]: string };
}
