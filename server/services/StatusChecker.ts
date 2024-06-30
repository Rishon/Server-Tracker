// Servers.json data
import serversList from "../servers.json";

// Services
import MongoDB from "./MongoDB";

// Query
import { ping } from "minecraft-server-ping";

interface ServerData {
  currentPlayers: Number;
  image: String;
}

interface ServerInfo {
  address: String;
  currentPlayers: Number;
  image: String;
}

const serversData: { java: ServerInfo[]; bedrock: ServerInfo[] } = {
  java: [],
  bedrock: [],
};

class StatusChecker {
  private async getServerInfo(address: string): Promise<ServerData> {
    return new Promise(async (resolve) => {
      await ping(() => Promise.resolve({ hostname: address, port: 25565 }), {
        timeout: 5000,
      })
        .then((data) => {
          resolve({
            image: data.favicon || "",
            currentPlayers: data.players.online,
          });
        })
        .catch(() => {
          resolve({
            image: "",
            currentPlayers: 0,
          });
        });
    });
  }

  public async fetchServersData() {
    let startTime = new Date().getTime();
    console.log("Fetching servers data...");

    await MongoDB.removeInvalidServers(serversList.java);

    for (const server of serversList.java) {
      const info = await this.getServerInfo(server.address);

      if (!info || info.image === "") {
        console.error(`Error fetching server info for ${server.name}`);
        continue;
      }

      // Ping server
      await MongoDB.pingServer(
        server.name,
        server.address,
        info.currentPlayers,
        info.image
      );

      const mongoServer = await MongoDB.getServerData(server.name);
      if (!mongoServer) {
        console.error(`Server ${server.name} not found in the database.`);
        continue;
      }

      const serverData = {
        ...server,
        currentPlayers: info.currentPlayers,
        maxPlayers: mongoServer.maxPlayers,
        totalPlayers: mongoServer.totalPlayers,
        image: mongoServer.image,
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
    console.log(`Fetched servers data in ${endTime - startTime}ms`);
  }

  public getServersData() {
    return serversData;
  }
}

export default StatusChecker;
