export async function readLine(conn: Deno.UnixConn): Promise<string> {
  const dec = new TextDecoder();
  const buf = new Uint8Array(1);
  let line: string = "";

  while (true) {
    if (line.indexOf("\n") !== -1) {
      return line.slice(0, line.length - 2);
    }
    await conn.read(buf);
    line += dec.decode(buf);
  }
}
