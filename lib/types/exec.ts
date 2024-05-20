
export interface StartExecRequest {
    Detach?: false;
    Tty?: false;
}

interface ProcessConfig {
    arguments: string[];
    entrypoint: string;
    privileged: boolean;
    tty: boolean;
    user: string;
}

export interface ExecInfo {
    CanRemove: boolean;
    ContainerID: string;
    DetachKeys: string;
    ExitCode: number;
    ID: string;
    OpenStderr: boolean;
    OpenStdin: boolean;
    OpenStdout: boolean;
    ProcessConfig: ProcessConfig;
    Running: boolean;
    Pid: number;
}