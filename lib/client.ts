import { HttpRequest, HttpResponse } from "./types/http.ts";
import {
  parseBody,
  parseHead,
  parseHeaders,
  writeRequest,
} from "./util/http.ts";

export class DockerClient {
  socketPath: string;

  constructor(path: string) {
    this.socketPath = path;
  }

  async request(
    method: string,
    path: string,
    body: string,
    query: URLSearchParams,
  ): Promise<HttpResponse> {
    const conn = await Deno.connect({
      path: this.socketPath,
      transport: "unix",
    });
    const request: HttpRequest = {
      method: method,
      path: path,
      body: body,
      query: query,
      headers: {},
    };
    await writeRequest(conn, request);
    const statusCode = await parseHead(conn);
    const headers = await parseHeaders(conn);
    const responseBody = await parseBody(conn, headers);
    const response: HttpResponse = {
      status: statusCode,
      headers: headers,
      body: responseBody,
    };
    conn.close();
    return response as HttpResponse;
  }
}
