import {DockerClient} from "./client.ts";
import {
    ContainerInfo,
    ContainerListInfo,
    ContainerStats,
    ContainerUpdateRequest,
    CreateContainerRequest,
    CreateContainerResponse, CreateExecRequest,
    CreateExecResponse,
    FSChanges,
    ProcessInfo,
    WaitContainerResponse,
} from "./types/container.ts";
import {Exec} from "./exec.ts";

/**
 * Represents a Docker container.
 */
export class Container {
    client: DockerClient;
    id?: string;

    constructor(client: DockerClient) {
        this.client = client;
    }

    /**
     * Creates a container with the specified container name and options.
     *
     * @param {string} containerName - The name of the container.
     * @param {CreateContainerRequest} options - The options object containing the details of the container to be created.
     * @return {Promise<Container>} A Promise that resolves to the created Container object.
     * @throws {Error} Throws an error in case of failure with appropriate error messages.
     *                 Possible error conditions include:
     *                 - Bad parameter (HTTP status 400)
     *                 - No such image (HTTP status 404)
     *                 - Conflict (HTTP status 409)
     *                 - Server error (HTTP status 500)
     *                 - Unexpected status code
     */
    async create(
        containerName: string,
        options: CreateContainerRequest,
    ): Promise<Container> {
        const res = await this.client.request(
            "POST",
            "/containers/create",
            JSON.stringify(options),
            new URLSearchParams({"name": containerName}),
        );

        switch (res.status.valueOf()) {
            case 201: {
                const container = new Container(this.client);
                const responseBody = await res.json() as CreateContainerResponse;
                container.id = responseBody.Id!;
                return container;
            }
            case 400:
                throw new Error("Bad parameter");
            case 404:
                throw new Error("No such image");
            case 409:
                throw new Error("Conflict");
            case 500:
                throw new Error("Server error");
            default:
                throw new Error(`Unexpected status code: ${res.status}`);
        }
    }

    /**
     * Starts an already created container.
     *
     * @param {string} [detachKeys=""] - Override the key sequence for detaching a container.
     *
     * @throws {Error} When the container is not created.
     * @throws {Error} When the container is already started.
     * @throws {Error} When there is no such container.
     * @throws {Error} When a server error occurs.
     * @throws {Error} When an unexpected status code is returned.
     *
     * @returns {Promise<void>}
     */
    async start(detachKeys: string = ""): Promise<void> {
        if (this.id == null) {
            throw new Error("Container not created.");
        }
        const res = await this.client.request(
            "POST",
            `/containers/${this.id}/start`,
            JSON.stringify({}),
            new URLSearchParams({"detachKeys": detachKeys}),
        );

        switch (res.status.valueOf()) {
            case 204:
                return;
            case 304:
                throw new Error("Container already started");
            case 404:
                throw new Error("No such container");
            case 500:
                throw new Error("Server error");
            default:
                throw new Error(`Unexpected status code: ${res.status}`);
        }
    }

    /**
     * Stops the container.
     *
     * @param {number} [wait=0] - The time to wait in seconds before stopping the container.
     * @throws {Error} Thrown when the container is not created.
     * @throws {Error} Thrown when the container is already stopped.
     * @throws {Error} Thrown when no such container exists.
     * @throws {Error} Thrown when a server error occurs.
     */
    async stop(wait: number = 0) {
        if (this.id == null) {
            throw new Error("Container not created.");
        }
        const res = await this.client.request(
            "POST",
            `/containers/${this.id}/stop`,
            JSON.stringify({}),
            new URLSearchParams({"t": wait.toString()}),
        );

        switch (res.status.valueOf()) {
            case 204:
                return;
            case 304:
                throw new Error("container already stopped");
            case 404:
                throw new Error("no such container");
            case 500:
                throw new Error("server error");
            default:
                throw new Error(`Unexpected status code: ${res.status}`);
        }
    }

    /**
     * Deletes the container.
     *
     * @param {boolean} [v=false] - Indicates whether to remove anonymous volumes associated with the container.
     * @param {boolean} [force=false] - Indicates whether to kill the container if it is running.
     * @param {boolean} [link=false] - Indicates whether to remove the specified link associated with the container.
     * @throws {Error} Container not created.
     * @throws {Error} Bad parameter.
     * @throws {Error} No such container.
     * @throws {Error} Conflict.
     * @throws {Error} Server error.
     * @throws {Error} Unexpected status code.
     */
    async rm(v: boolean = false, force: boolean = false, link: boolean = false) {
        if (this.id == null) {
            throw new Error("Container not created.");
        }

        const res = await this.client.request(
            "DELETE",
            `/containers/${this.id}`,
            JSON.stringify({}),
            new URLSearchParams({
                "v": v.toString(),
                "force": force.toString(),
                "link": link.toString(),
            }),
        );

        switch (res.status.valueOf()) {
            case 204:
                return;
            case 400:
                throw new Error("bad parameter");
            case 404:
                throw new Error("no such container");
            case 409:
                throw new Error("conflict");
            case 500:
                throw new Error("server error");
            default:
                throw new Error(`Unexpected status code: ${res.status}`);
        }
    }

    /**
     * Renames the container with the given name.
     * @param {string} name - The new name for the container.
     * @throws {Error} If the container has not been created.
     * @throws {Error} If there is no container with the given name.
     * @throws {Error} If the new name is already in use.
     * @throws {Error} If there is a server error.
     */
    async rename(name: string) {
        if (this.id == null) {
            throw new Error("Container not created.");
        }

        const res = await this.client.request(
            "POST",
            `/containers/${this.id}/rename`,
            JSON.stringify({}),
            new URLSearchParams({"name": name}),
        );

        switch (res.status.valueOf()) {
            case 204:
                return;
            case 404:
                throw new Error("no such container");
            case 409:
                throw new Error("name already in use");
            case 500:
                throw new Error("server error");
            default:
                throw new Error(`Unexpected status code: ${res.status}`);
        }
    }

    /**
     * Kills the container.
     *
     * @param {string} signal - The signal to send to the container. Default value is "SIGKILL".
     * @throws {Error} Throws an error if the container has not been created.
     * @throws {Error} Throws an error if no such container exists.
     * @throws {Error} Throws an error if the container is not running.
     * @throws {Error} Throws an error if there is a server error.
     * @throws {Error} Throws an error if an unexpected status code is received.
     * @returns {Promise<void>} Returns a promise that resolves when the container is killed successfully.
     */
    async kill(signal: string = "SIGKILL"): Promise<void> {
        if (this.id == null) {
            throw new Error("Container not created.");
        }
        const res = await this.client.request(
            "POST",
            `/containers/${this.id}/kill`,
            JSON.stringify({}),
            new URLSearchParams({"signal": signal}),
        );

        switch (res.status.valueOf()) {
            case 204:
                return;
            case 404:
                throw new Error("no such container");
            case 409:
                throw new Error("container is not running");
            case 500:
                throw new Error("server error");
            default:
                throw new Error(`Unexpected status code: ${res.status}`);
        }
    }

    async pause() {
        if (this.id == null) {
            throw new Error("Container not created.");
        }
        const res = await this.client.request(
            "POST",
            `/containers/${this.id}/pause`,
            JSON.stringify({}),
            new URLSearchParams({}),
        );

        switch (res.status.valueOf()) {
            case 204:
                return;
            case 404:
                throw new Error("no such container");
            case 409:
                throw new Error("container is not running");
            case 500:
                throw new Error("server error");
            default:
                throw new Error(`Unexpected status code: ${res.status}`);
        }
    }

    /**
     * Unpauses a container.
     *
     * @throws {Error} If the container is not created.
     * @throws {Error} If there is no such container.
     * @throws {Error} If there is a server error.
     * @throws {Error} If an unexpected status code is returned.
     *
     * @returns {Promise<void>} Resolves if the container is successfully unpaused.
     */
    async unpause(): Promise<void> {
        if (this.id == null) {
            throw new Error("Container not created.");
        }
        const res = await this.client.request(
            "POST",
            `/containers/${this.id}/unpause`,
            JSON.stringify({}),
            new URLSearchParams({}),
        );

        switch (res.status.valueOf()) {
            case 204:
                return;
            case 404:
                throw new Error("no such container");
            case 500:
                throw new Error("server error");
            default:
                throw new Error(`Unexpected status code: ${res.status}`);
        }
    }

    /**
     * Retrieves information about a container.
     *
     * @param {boolean} [size=false] - Specifies whether to include size information in the response.
     * @returns {Promise<ContainerInfo>} - A Promise that resolves with the ContainerInfo object containing information about the container.
     * @throws {Error} - If the container has not been created, or if there is an unexpected status code in the response.
     * @throws {Error} - If the container does not exist.
     * @throws {Error} - If there is a server error.
     */
    async inspect(size: boolean = false): Promise<ContainerInfo> {
        if (this.id == null) {
            throw new Error("Container not created.");
        }
        const res = await this.client.request(
            "GET",
            `/containers/${this.id}/json`,
            "",
            new URLSearchParams({"size": size.toString()}),
        );

        switch (res.status.valueOf()) {
            case 200:
                return await res.json() as ContainerInfo;
            case 404:
                throw new Error("no such container");
            case 500:
                throw new Error("server error");
            default:
                throw new Error(`Unexpected status code: ${res.status}`);
        }
    }

    /**
     * Retrieves a list of containers.
     *
     * @param {boolean} [all] - Whether to show all containers or only running containers. Default is false.
     * @param {number} [limit] - The maximum number of containers to return.
     * @param {boolean} [size] - Whether to include the size of each container. Default is false.
     * @param {string} [filters] - A string of filters to apply to the list.
     *
     * @returns {Promise<Container[]>} The list of containers.
     * @throws {Error} If there is a bad parameter or server error.
     */
    async list(
        all?: boolean,
        limit?: number,
        size?: boolean,
        filters?: string,
    ): Promise<Container[]> {
        const res = await this.client.request(
            "GET",
            `/containers/json`,
            "",
            new URLSearchParams({
                "all": all ? "true" : "",
                "limit": limit ? limit.toString() : "",
                "size": size ? size.toString() : "",
                "filters": filters ? filters.toString() : "",
            }),
        );

        switch (res.status.valueOf()) {
            case 200: {
                const responseData = await res.json() as ContainerListInfo[];
                return responseData.map((info) => {
                    const container = new Container(this.client);
                    container.id = info.Id;
                    return container;
                });
            }
            case 400:
                throw new Error("bad parameter");
            case 500:
                throw new Error("server error");
            default:
                throw new Error(`Unexpected status code: ${res.status}`);
        }
    }

    /**
     * Retrieves process information for a container.
     *
     * @param {string} [args="-ef"] - The ps_args to use when retrieving process information. Default is "-ef".
     * @returns {Promise<ProcessInfo>} - A promise that resolves to the process information.
     * @throws {Error} - If the container does not exist or if there is a server error.
     */
    async processes(args: string = "-ef"): Promise<ProcessInfo> {
        const res = await this.client.request(
            "GET",
            `/containers/${this.id}/top`,
            "",
            new URLSearchParams({
                "ps_args": args,
            }),
        );

        switch (res.status.valueOf()) {
            case 200:
                return await res.json() as ProcessInfo;
            case 404:
                throw new Error("no such container");
            case 500:
                throw new Error("server error");
            default:
                throw new Error(`Unexpected status code: ${res.status}`);
        }
    }

    /**
     * Retrieves the changes made to the file system of a container.
     *
     * @returns {Promise<FSChanges[]>} A promise that resolves with an array of FSChanges objects representing the changes made to the file system of the container.
     * @throws {Error} Throws an error if the container is not created, or if the API request encounters an error.
     */
    async fsChanges(): Promise<FSChanges[]> {
        if (this.id == null) {
            throw new Error("Container not created.");
        }
        const res = await this.client.request(
            "GET",
            `/containers/${this.id}/changes`,
            "",
            new URLSearchParams({}),
        );
        switch (res.status.valueOf()) {
            case 200:
                return await res.json() as FSChanges[];
            case 404:
                throw new Error("no such container");
            case 500:
                throw new Error("server error");
            default:
                throw new Error(`Unexpected status code: ${res.status}`);
        }
    }

    /**
     * Change various configuration options of a container without having to recreate it.
     *
     * @param {ContainerUpdateRequest} options - The update options object.
     * @return {Promise<Container>} - A Promise that resolves to the updated container.
     * @throws {Error} - If the container is not created, or if there is an unexpected error or status code.
     */
    async update(options: ContainerUpdateRequest): Promise<Container> {
        if (this.id == null) {
            throw new Error("Container not created.");
        }
        const res = await this.client.request(
            "POST",
            `/containers/${this.id}/update`,
            JSON.stringify(options),
            new URLSearchParams({}),
        );
        switch (res.status.valueOf()) {
            case 200:
                return this;
            case 404:
                throw new Error("no such container");
            case 500:
                throw new Error("server error");
            default:
                throw new Error(`Unexpected status code: ${res.status}`);
        }
    }

    /**
     * Block until a container stops, then returns the exit code.
     *
     * @param {string} [condition="not-running"] - The condition to wait for. Possible values are "not-running" | "next-exit" | "removed"
     * @returns {Promise<WaitContainerResponse>} - A promise that resolves with the response of the wait operation.
     * @throws {Error} - Throws an error if the container is not created or if an unexpected status code is received.
     * @throws {Error} - Throws an error if the parameter is invalid, the container does not exist, or there is a server error.
     */
    async wait(
        condition: string = "not-running",
    ): Promise<WaitContainerResponse> {
        if (this.id == null) {
            throw new Error("Container not created.");
        }

        const res = await this.client.request(
            "POST",
            `/containers/${this.id}/wait`,
            "",
            new URLSearchParams({"condition": condition}),
        );

        switch (res.status.valueOf()) {
            case 200:
                return await res.json() as WaitContainerResponse;
            case 400:
                throw new Error("bad parameter");
            case 404:
                throw new Error("no such container");
            case 500:
                throw new Error("server error");
            default:
                throw new Error(`Unexpected status code: ${res.status}`);
        }
    }

    /**
     * Get container stats based on resource usage.
     *
     * @param {boolean} [stream] - Stream the output. If false, the stats will be output once, and then it will disconnect. Default is true
     * @return {Promise<ContainerStats>} - A promise that resolves with the statistics of the container.
     * @throws {Error} - If the container is not created, or if an unexpected status code is returned.
     * @throws {Error} - If no such container is found or if there is a server error.
     */
    async stats(stream?: boolean): Promise<ContainerStats> {
        if (this.id == null) {
            throw new Error("Container not created.");
        }

        const res = await this.client.request(
            "GET",
            `/containers/${this.id}/stats`,
            "",
            new URLSearchParams({"stream": stream ? stream.toString() : ""}),
        );

        switch (res.status.valueOf()) {
            case 200:
                return await res.json() as ContainerStats;
            case 404:
                throw new Error("no such container");
            case 500:
                throw new Error("server error");
            default:
                throw new Error(`Unexpected status code: ${res.status}`);
        }
    }

    /**
     * Retrieves the logs of a container.
     *
     * @param {boolean} [follow=false] - Whether to stream the logs or not.
     * @param {boolean} [stdout=true] - Whether to include stdout logs or not.
     * @param {boolean} [stderr=false] - Whether to include stderr logs or not.
     * @param {number} [since=0] - Timestamp in seconds to filter logs since a certain time.
     * @param {string} [tail="all"] - Number of lines to show from the end of the logs.
     * @param {number} [until=0] - Timestamp in seconds to filter logs until a certain time.
     * @param {boolean} [timestamp=false] - Whether to include timestamps in the log lines or not.
     *
     * @returns {Promise<string>} - The logs of the container.
     *
     * @throws {Error} - If the container is not created.
     * @throws {Error} - If the container with the given id does not exist.
     * @throws {Error} - If there is a server error.
     * @throws {Error} - If an unexpected HTTP status code is received.
     */
    async logs(
        follow: boolean = false,
        stdout: boolean = true,
        stderr: boolean = false,
        since: number = 0,
        tail: string = "all",
        until: number = 0,
        timestamp: boolean = false,
    ): Promise<string> {
        if (this.id == null) {
            throw new Error("Container not created.");
        }

        const res = await this.client.request(
            "GET",
            `/containers/${this.id}/logs`,
            "",
            new URLSearchParams({
                "follow": follow.toString(),
                "stdout": stdout.toString(),
                "stderr": stderr.toString(),
                "since": since.toString(),
                "tail": tail,
                "until": until.toString(),
                "timestamps": timestamp.toString(),
            }),
        );

        switch (res.status.valueOf()) {
            case 200:
                return res.text();
            case 404:
                throw new Error("no such container");
            case 500:
                throw new Error("server error");
            default:
                throw new Error(`Unexpected status code: ${res.status}`);
        }
    }

    /**
     * Executes a command inside a container.
     *
     * @param {CreateExecRequest} options - The options for executing the command.
     * @returns {Promise<Exec>} - A promise that resolves to the executed command.
     * @throws {Error} - If the container is not created
     * @throws {Error} - If the container is paused
     * @throws {Error} - If the server responds with 500 status code.
     * @throws {Error} - If an unexpected status code is returned.
     */
    async exec(options: CreateExecRequest):Promise<Exec> {
        if (this.id == null) {
            throw new Error("Container not created.");
        }

        const res = await this.client.request(
            "POST",
            `/containers/${this.id}/exec`,
            JSON.stringify(options),
            new URLSearchParams({}),
        );

        switch (res.status.valueOf()) {
            case 201: {
                const jsonResponse = await res.json() as CreateExecResponse
                const exec = new Exec(this.client);
                exec.id = jsonResponse.Id;
                return exec;
            }
            case 404:
                throw new Error("no such container");
            case 409:
                throw new Error("container is paused");
            case 500:
                throw new Error("server error");
            default:
                throw new Error(`Unexpected status code: ${res.status}`);
        }
    }

}
