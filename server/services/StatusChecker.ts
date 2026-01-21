// Servers.json data
import serversList from "../servers.json";

// Services
import MongoDB from "./MongoDB";

// Query
import { ping } from "minecraft-server-ping";

// Utils
import { getFallbackImage } from "../utils/ImageData";

// Interfaces
interface ServerData {
  isOnline?: Boolean;
  currentPlayers: Number;
  image: String;
  motd: String;
}

interface ServerInfo {
  isOnline?: Boolean;
  address: String;
  port?: Number;
  currentPlayers: Number;
  image: String;
  motd: String;
}

type ExtraObject = {
  color?: string;
  extra?: ExtraObject[];
  text?: string;
};

type MotdData = {
  extra?: ExtraObject[];
  text?: string;
};

const serversData: { java: ServerInfo[]; bedrock: ServerInfo[] } = {
  java: [],
  bedrock: [],
};

class StatusChecker {
  private async getServerInfo(
    address: string,
    port: number = 25565
  ): Promise<ServerData> {
    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const data = await ping(
          () => Promise.resolve({ hostname: address, port }),
          { timeout: 1000 * 15 }
        );

        const motd = data.description as MotdData;
        const colorTextMap: string[] = [];
        extractData(motd, colorTextMap);

        const coloredText = colorTextMap.join(" ");

        return {
          isOnline: true,
          image: data.favicon || "",
          motd: coloredText,
          currentPlayers: data.players.online,
        };
      } catch (error) {
        if (attempt === MAX_RETRIES) {
          return {
            isOnline: false,
            image: "",
            motd: "",
            currentPlayers: 0,
          };
        }

        await new Promise((res) => setTimeout(res, 500));
      }
    }

    return {
      isOnline: false,
      image: "",
      motd: "",
      currentPlayers: 0,
    };
  }


  public async fetchServersData() {
    let startTime = new Date().getTime();
    console.log("Fetching servers data...");

    serversData.java.length = 0;

    const serverMap = new Map<string, any>();

    const list = serversList.java as {
      name: string;
      address: string;
      port: number;
    }[];

    await MongoDB.removeInvalidServers(serversList.java);

    for (const server of list) {
      const info = await this.getServerInfo(server.address, server.port);

      if (!info) {
        console.error(`Error fetching server info for ${server.name}`);
        continue;
      }

      // Vanilla unknown_server.png
      var image = info.image;

      if (!image)
        image = getFallbackImage();

      // Motd
      var motd = info.motd;
      if (!motd) motd = "Server Offline";

      // Ping server
      await MongoDB.pingServer(
        server.name,
        server.address,
        server.port as number,
        info.currentPlayers,
        image,
        motd
      );

      const mongoServer = await MongoDB.getServerData(
        server.name,
        server.address
      );
      if (!mongoServer) {
        console.error(`Server ${server.name} not found in the database.`);
        continue;
      }

      const serverData = {
        ...server,
        isOnline: info.isOnline,
        currentPlayers: info.currentPlayers,
        maxPlayers: mongoServer.maxPlayers,
        totalPlayers: mongoServer.totalPlayers,
        image: mongoServer.image,
        motd: mongoServer.motd,
        pings: mongoServer.ping,
      };

      const key = `${server.address}:${server.port}`;

      serverMap.set(key, serverData);
    }

    serversData.java.push(...serverMap.values());

    const endTime = Date.now();
    console.log(
      `Fetched servers data in ${endTime - startTime}ms (${Math.floor(
        (endTime - startTime) / 1000
      )}s)`
    );
  }

  public getServersData() {
    return serversData;
  }
}

function extractData(obj: ExtraObject, colorTextMap: string[] = []): string {
  let result = obj.text ? obj.text : "";

  if (obj.color && obj.text) {
    colorTextMap.push(`${obj.color}:${obj.text}`);
  }

  if (obj.extra && Array.isArray(obj.extra)) {
    for (const extraObj of obj.extra) {
      result += extractData(extraObj, colorTextMap);
    }
  }

  return result;
}

export default StatusChecker;
