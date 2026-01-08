// Servers.json data
import serversList from "../servers.json";

// Services
import MongoDB from "./MongoDB";

// Query
import { ping } from "minecraft-server-ping";

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
    return new Promise(async (resolve) => {
      await ping(() => Promise.resolve({ hostname: address, port: port }), {
        timeout: 1000 * 15,
      })
        .then((data) => {
          const colorTextMap: string[] = [];
          const coloredText = colorTextMap.join(" ");

          resolve({
            isOnline: true,
            image: data.favicon || "",
            motd: coloredText,
            currentPlayers: data.players.online,
          });
        })
        .catch(() => {
          resolve({
            isOnline: false,
            image: "",
            motd: "",
            currentPlayers: 0,
          });
        });
    });
  }

  public async fetchServersData() {
    let startTime = new Date().getTime();
    console.log("Fetching servers data...");

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
        image =
          "data:image/png;base64,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";

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

      const index = serversData.java.findIndex(
        (s) => s.address === server.address
      );

      if (index === -1) {
        serversData.java.push(serverData);
      } else {
        serversData.java[index] = serverData;
      }
    }

    let endTime = new Date().getTime();
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
