import {DockerClient} from "./client.ts";
import {ExecInfo, StartExecRequest} from "./types/exec.ts";

/**
 * Represents an Exec instance for executing commands in a Docker container.
 */
export class Exec {
    client: DockerClient;
    id?: string;

    constructor(client: DockerClient) {
        this.client = client;
    }

    /**
     * Starts the execution of the given exec instance.
     * Throws an error if the exec instance does not exist, or if the container is stopped or paused.
     *
     * @param {StartExecRequest} options - The options for starting the exec instance.
     * @return {Promise<void>} - A promise that resolves when the execution is successfully started.
     * @throws {Error} - If the exec instance does not exist
     * @throws {Error} - If the container is stopped or paused
     * @throws {Error} - If there is an unexpected status code.
     */
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

    /**
     * Retrieves information about the execution instance
     *
     * @returns {Promise<ExecInfo>} A promise that resolves with the execution information
     * @throws {Error} If the execution instance has not been created
     * @throws {Error} If the execution instance does not exist
     * @throws {Error} If there is a server error
     * @throws {Error} If an unexpected status code is received
     */
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