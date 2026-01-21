// MongoDB package
import mongoose from "mongoose";

// Models
import ServerModel from "../models/ServerModel";

// Platform type
type Platform = "minecraft" | "hytale";

class MongoService {
  // Connect to MongoDB
  static async connect(uri: string) {
    const options = {
      dbName: "tracker-db",
    } as mongoose.ConnectOptions;

    await mongoose
      .connect(uri, options)
      .then(async () => {
        console.log("Connected to MongoDB");
      })
      .catch((err) => {
        console.error("Error connecting to MongoDB", err);
      });
  }

  // Ping server
  static async pingServer(
    name: String,
    address: String,
    port: Number,
    currentPlayers: Number,
    image: String,
    motd: String,
    platform: Platform
  ) {
    let server = await ServerModel.findOne({ address, platform });
    let currentDateTime = new Date().getTime() as Number;

    if (!server) {
      server = new ServerModel({
        name,
        address,
        port,
        platform,
        maxPlayers: currentPlayers,
        totalPlayers: currentPlayers,
        ping: [],
        image,
        motd,
      });
    }

    // Update address
    server.address = address;

    // Update port
    if (port != 25565) server.port = port;

    server.ping.push({
      currentPlayers: currentPlayers,
      timestamp: currentDateTime,
    });

    // 1440 minutes = 24 hours
    if (server.ping.length > 1440)
      server.ping = server.ping.slice(server.ping.length - 1440);

    // Update server image
    server.image = image;

    // Update server motd
    server.motd = motd;

    // Update max players based on last 24 hours pings
    if (server.maxPlayers === undefined) server.maxPlayers = 0;

    let currentMaxPlayers = 0 as Number;

    server.ping.forEach((ping) => {
      if (ping.currentPlayers > currentMaxPlayers)
        currentMaxPlayers = ping.currentPlayers;
    });

    server.maxPlayers = currentMaxPlayers;

    // Update total players
    if (server.totalPlayers === undefined) server.totalPlayers = 0;
    if (server.totalPlayers < currentPlayers)
      server.totalPlayers = currentPlayers;

    await server.save();
  }

  // Delete servers that are not in the servers list
  static async removeInvalidServers(serversList: Array<any>) {
    const servers = await ServerModel.find();
    for (const server of servers) {
      if (!serversList.find((s) => s.address === server.address)) {
        //  console.log(`Server ${server.address} not found in the servers list.`);
        await server.deleteOne();
      }
    }
  }

  // Get server data
  static async getServerData(
    address: String,
  ) {
    return ServerModel.findOne({ address });
  }
}

export default MongoService;
