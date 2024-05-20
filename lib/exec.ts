import {DockerClient} from "./client.ts";
import {ExecInfo, StartExecRequest} from "./types/exec.ts";

export class Exec {
    client: DockerClient;
    id?: string;

    constructor(client: DockerClient) {
        this.client = client;
    }

    async start(options: StartExecRequest) :Promise<void> {
        if (this.id == null) {
            throw new Error("exec instance not created");
        }

        const res = await this.client.request(
            "POST",
            `/exec/${this.id}/start`,
            JSON.stringify(options),
            new URLSearchParams({}),
        )

        switch (res.status.valueOf()) {
            case 200:
                return ;
            case 404:
                throw new Error("No such exec instance");
            case 409:
                throw new Error("Container is stopped or paused");
            default:
                throw new Error(`Unexpected status code: ${res.status}`);
        }
    }

    async inspect(): Promise<ExecInfo> {
        if (this.id == null) {
            throw new Error("exec instance not created");
        }

        const res = await this.client.request(
            "GET",
            `/exec/${this.id}/json`,
            "",
            new URLSearchParams({}),
        )

        switch (res.status.valueOf()) {
            case 200: {
                return JSON.parse(res.body) as ExecInfo;
            }
            case 404:
                throw new Error("No such exec instance");
            case 500:
                throw new Error("Server error");
            default:
                throw new Error(`Unexpected status code: ${res.status}`);
        }
    }

}