// Servers.json data
import serversList from "../servers.json";

// Services
import MongoDB from "./MongoDB";

// Query
import { ping } from "minecraft-server-ping";
import { query } from '@hytaleone/query';

// Utils
import { getFallbackHytaleImage, getFallbackMCImage } from "../utils/ImageData";

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

type Platform = "minecraft" | "hytale";

const serversData: Record<Platform, ServerInfo[]> = {
  minecraft: [],
  hytale: [],
};

class StatusChecker {

  public async fetchServersData(platform: Platform) {
    const startTime = Date.now();
    console.log(`Fetching ${platform} servers data...`);

    serversData[platform].length = 0;

    const list = serversList[platform] as {
      name: string;
      address: string;
      port: number;
    }[];

    const tasks = list.map(server =>
      this.fetchSingleServer(server, platform)
    );

    const results = await Promise.allSettled(tasks);

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        serversData[platform].push(result.value);
      }
    }

    const endTime = Date.now();
    console.log(
      `Fetched ${platform} servers in ${endTime - startTime}ms`
    );
  }

  private async fetchSingleServer(
    server: {
      name: string;
      address: string;
      port: number;
    },
    platform: Platform
  ) {
    try {
      const info =
        platform === "minecraft"
          ? await this.getMinecraftServerInfo(server.address, server.port)
          : await this.getHytaleServerInfo(server.address, server.port);

      const image =
        platform === "hytale"
          ? getFallbackHytaleImage()
          : info.image || getFallbackMCImage();

      const motd = info.motd || "Server Offline";

      await MongoDB.pingServer(
        server.name,
        server.address,
        server.port,
        info.currentPlayers,
        image,
        motd,
        platform
      );

      const mongoServer = await MongoDB.getServerData(server.address);
      if (!mongoServer) return null;

      return {
        ...server,
        platform,
        isOnline: info.isOnline,
        currentPlayers: info.currentPlayers,
        maxPlayers: mongoServer.maxPlayers,
        totalPlayers: mongoServer.totalPlayers,
        image: mongoServer.image,
        motd: mongoServer.motd,
        pings: mongoServer.ping,
      };
    } catch (err) {
      console.error(`[${platform}] Failed fetching ${server.name}`, err);
      return null;
    }
  }

  private async getMinecraftServerInfo(
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

        return {
          isOnline: true,
          image: data.favicon || "",
          motd: colorTextMap.join(" "),
          currentPlayers: data.players.online,
        };
      } catch {
        if (attempt === MAX_RETRIES) {
          return {
            isOnline: false,
            image: "",
            motd: "",
            currentPlayers: 0,
          };
        }

        await new Promise((r) => setTimeout(r, 500));
      }
    }

    return {
      isOnline: false,
      image: "",
      motd: "",
      currentPlayers: 0,
    };
  }

  private async getHytaleServerInfo(
    address: string,
    port: number = 5520
  ): Promise<ServerData> {

    try {
      const info = await query(address, port);

      return {
        isOnline: true,
        image: "", // Hytale does not provide icons yet
        motd: info.motd || "",
        currentPlayers: info.currentPlayers || 0,
      };
    } catch (e) {
      return {
        isOnline: false,
        image: "",
        motd: "",
        currentPlayers: 0,
      };
    }
  }

  public async refreshAllServers() {
    await this.fetchServersData("minecraft");
    await this.fetchServersData("hytale");

    const allServers = [
      ...serversList.minecraft,
      ...serversList.hytale
    ];

    await MongoDB.removeInvalidServers(allServers);
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
