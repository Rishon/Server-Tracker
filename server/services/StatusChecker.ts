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

const serversData: { minecraft: ServerInfo[]; hytale: ServerInfo[] } = {
  minecraft: [],
  hytale: [],
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
          { timeout: 1000 }
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
    const startTime = Date.now();
    console.log("Fetching servers data...");

    serversData.minecraft.length = 0;

    const list = serversList.minecraft as {
      name: string;
      address: string;
      port: number;
    }[];

    await MongoDB.removeInvalidServers(list);

    const tasks = list.map((server) =>
      this.fetchSingleServer(server)
    );

    const results = await Promise.allSettled(tasks);

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        serversData.minecraft.push(result.value);
      }
    }

    const endTime = Date.now();
    console.log(
      `Fetched servers data in ${endTime - startTime}ms (${Math.floor(
        (endTime - startTime) / 1000
      )}s)`
    );
  }

  private async fetchSingleServer(server: {
    name: string;
    address: string;
    port: number;
  }) {
    try {
      const info = await this.getServerInfo(server.address, server.port);

      let image = info.image || getFallbackImage();
      let motd = info.motd || "Server Offline";

      await MongoDB.pingServer(
        server.name,
        server.address,
        server.port,
        info.currentPlayers,
        image,
        motd
      );

      const mongoServer = await MongoDB.getServerData(
        server.name,
        server.address
      );

      if (!mongoServer) return null;

      return {
        ...server,
        isOnline: info.isOnline,
        currentPlayers: info.currentPlayers,
        maxPlayers: mongoServer.maxPlayers,
        totalPlayers: mongoServer.totalPlayers,
        image: mongoServer.image,
        motd: mongoServer.motd,
        pings: mongoServer.ping,
      };
    } catch (err) {
      console.error(`Failed fetching ${server.name}`, err);
      return null;
    }
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
