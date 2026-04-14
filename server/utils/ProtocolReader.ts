// yep, AI did this, I ain't making my own byte reader

import * as net from "net";
import * as dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

export interface ServerStatus {
  version: {
    name: string;
    protocol: number;
  };
  players: {
    max: number;
    online: number;
    sample?: { name: string; id: string }[];
  };
  description: string | { text: string; extra?: any[] };
  favicon?: string;
}

export class ProtocolReader {
  /**
   * Pings a Minecraft server
   */
  static async ping(
    host: string,
    port: number = 25565,
    timeout: number = 5000,
  ): Promise<ServerStatus> {
    let connectHost = host;
    let connectPort = port;

    try {
      const records = await dns.promises.resolveSrv(`_minecraft._tcp.${host}`);
      if (records && records.length > 0) {
        records.sort((a, b) => a.priority - b.priority || a.weight - b.weight);
        connectHost = records[0].name;
        connectPort = records[0].port;
      }
    } catch (err) {
      if (
        (err as NodeJS.ErrnoException).code !== "ENODATA" &&
        (err as NodeJS.ErrnoException).code !== "ENOTFOUND"
      ) {
        console.log(`DNS SRV Error for ${host}:`, (err as any).message);
      }
    }

    return new Promise((resolve, reject) => {
      const socket = net.createConnection(connectPort, connectHost);
      socket.setTimeout(timeout);

      let buffer = Buffer.alloc(0);

      socket.on("connect", () => {
        const hostBuffer = Buffer.from(host, "utf8");
        const portBuffer = Buffer.alloc(2);
        portBuffer.writeUInt16BE(port, 0);

        const handshakeData = Buffer.concat([
          this.writeVarInt(754), // Protocol version
          this.writeVarInt(hostBuffer.length), // Server Address Length
          hostBuffer, // Server Address
          portBuffer, // Server Port
          this.writeVarInt(1), // Next state: 1 (Status)
        ]);

        const packet1 = this.createPacket(0x00, handshakeData);
        const packet2 = this.createPacket(0x00, Buffer.alloc(0));
        socket.write(Buffer.concat([packet1, packet2]));
      });

      socket.on("data", (data: Buffer | string | any) => {
        const chunk =
          typeof data === "string" ? Buffer.from(data) : (data as Buffer);
        buffer = Buffer.concat([buffer, chunk]);

        if (buffer.length > 0) {
          try {
            // Extract standard packet details
            const packetLengthInfo = this.readVarInt(buffer, 0);
            const expectedCompleteLength =
              packetLengthInfo.length + packetLengthInfo.value;

            // Check if we have received the full chunk of the packet
            if (buffer.length >= expectedCompleteLength) {
              const body = buffer.subarray(
                packetLengthInfo.length,
                expectedCompleteLength,
              );
              const packetIdInfo = this.readVarInt(body, 0);

              if (packetIdInfo.value === 0x00) {
                const jsonLengthInfo = this.readVarInt(
                  body,
                  packetIdInfo.length,
                );
                const jsonStartOffset =
                  packetIdInfo.length + jsonLengthInfo.length;
                const jsonEndOffset = jsonStartOffset + jsonLengthInfo.value;

                const jsonStr = body
                  .subarray(jsonStartOffset, jsonEndOffset)
                  .toString("utf8");
                const result = JSON.parse(jsonStr) as ServerStatus;

                socket.end();
                resolve(result);
              }
            }
          } catch (err) {
            console.error("Handshake Parse Error:", err);
          }
        }
      });

      socket.on("timeout", () => {
        socket.destroy();
        reject(new Error(`Connection to ${host}:${port} timed out.`));
      });

      socket.on("error", (err) => {
        socket.destroy();
        reject(err);
      });
    });
  }

  private static writeVarInt(value: number): Buffer {
    const bytes: number[] = [];
    while (true) {
      if ((value & ~0x7f) === 0) {
        bytes.push(value);
        return Buffer.from(bytes);
      }
      bytes.push((value & 0x7f) | 0x80);
      value >>>= 7;
    }
  }

  private static readVarInt(
    buffer: Buffer,
    offset: number,
  ): { value: number; length: number } {
    let value = 0;
    let length = 0;
    let currentByte;

    do {
      currentByte = buffer[offset + length];
      if (currentByte === undefined)
        throw new Error("Incomplete VarInt buffer");

      value |= (currentByte & 0x7f) << (length * 7);
      length++;

      if (length > 5) throw new Error("VarInt is too big");
    } while ((currentByte & 0x80) === 0x80);

    return { value, length };
  }

  private static createPacket(packetId: number, data: Buffer): Buffer {
    const idBuffer = this.writeVarInt(packetId);
    const packetLength = idBuffer.length + data.length;
    return Buffer.concat([this.writeVarInt(packetLength), idBuffer, data]);
  }
}
