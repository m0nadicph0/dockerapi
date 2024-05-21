import {HttpHeader, HttpRequest} from "../types/http.ts";
import {readLine} from "./io.ts";

export function buildHead(request: HttpRequest): string {
    return `${request.method} ${request.path}?${request.query.toString()} HTTP/1.1\r\n`;
}

export function buildHeader(request: HttpRequest) {
    return Object.entries(request.headers).map(([key, value]) =>
        `${key}: ${value}`
    ).join("\r\n");
}

export async function writeRequest(conn: Deno.UnixConn, request: HttpRequest) {
    const enc = new TextEncoder();
    request.headers["Host"] = "docker";
    if (request.body.length > 0) {
        request.headers["Content-length"] = request.body.length.toString();
        request.headers["Content-type"] = "application/json";
    }
    const reqString = buildHead(request) + buildHeader(request) + "\r\n\r\n" +
        request.body;
    await conn.write(enc.encode(reqString));
}

export async function parseHead(conn: Deno.UnixConn): Promise<number> {
    const line = await readLine(conn);
    return parseInt(line.split(" ")[1]);
}

export async function parseHeaders(conn: Deno.UnixConn): Promise<HttpHeader> {
    let isEnd = false;

    const headers: HttpHeader = {};
    while (!isEnd) {
        const line = await readLine(conn);
        if (line === "") {
            isEnd = true;
        } else {
            const [name, value] = line.split(":");
            headers[name.trim()] = value.trim();
        }
    }
    return headers;
}

async function readChunked(conn: Deno.UnixConn): Promise<Uint8Array> {
    let isReadingFinished = false;
    let receivedBody = new Uint8Array();

    while (!isReadingFinished) {
        const sizeLine = await readLine(conn);
        const bufferSize = parseInt(sizeLine, 16);

        if (bufferSize === 0) {
            isReadingFinished = true;
        } else {
            const chunk = await readAndDecodeBufferIfSizeIsValid(bufferSize, conn);
            receivedBody = concatUint8Arrays(receivedBody, chunk);
            await readLine(conn);
        }
    }
    return receivedBody;
}


function concatUint8Arrays(arr1: Uint8Array, arr2: Uint8Array): Uint8Array {
    const combined = new Uint8Array(arr1.length + arr2.length);
    combined.set(arr1);
    combined.set(arr2, arr1.length);
    return combined;
}


async function readExact(conn: Deno.UnixConn, arr: Uint8Array): Promise<void> {
    let totalBytesRead = 0;
    while (totalBytesRead < arr.byteLength) {
        const bytesRead = await conn.read(arr.subarray(totalBytesRead));
        if (bytesRead === null) {
            throw new Error("Connection closed unexpectedly.");
        }
        totalBytesRead += bytesRead;
    }
}

async function readAndDecodeBufferIfSizeIsValid(
    bufferSize: number,
    conn: Deno.UnixConn
): Promise<Uint8Array> {
    if (!Number.isNaN(bufferSize)) {
        const buf = new ArrayBuffer(bufferSize);
        const arr = new Uint8Array(buf);
        await readExact(conn, arr);
        return arr;
    }
    return new Uint8Array();
}

async function readSized(conn: Deno.UnixConn, bufferSize: number): Promise<Uint8Array> {
    const buf = new ArrayBuffer(bufferSize);
    const arr = new Uint8Array(buf);
    await conn.read(arr);
    return arr;
}

export async function parseBody(conn: Deno.UnixConn, headers: HttpHeader): Promise<Uint8Array> {
    if (headers!["Transfer-Encoding"] === "chunked") {
        return await readChunked(conn);
    } else {
        const bufferSize = parseInt(headers!["Content-Length"], 10);
        return await readSized(conn, bufferSize);
    }
}

export function createResponse(status: number, headers: HttpHeader, body: Uint8Array): Response {
    switch (status.valueOf()) {
        case 204: return new Response(null, {
            status: status,
            headers: headers,
        });
        default: return new Response(body, {
            status: status,
            headers: headers,
        });
    }
}