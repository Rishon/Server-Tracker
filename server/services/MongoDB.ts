// MongoDB package
import mongoose from "mongoose";

// Models
import ServerModel from "../models/ServerModel";

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
    port: Number = 25565,
    currentPlayers: Number,
    image: String
  ) {
    var server = await ServerModel.findOne({ address: address });
    let currentDateTime = new Date().getTime() as Number;

    if (!server) {
      console.error(
        `Server ${name} not found... Registering it in the database.`
      );

      server = new ServerModel({
        name: name,
        address: address,
        port: port,
        maxPlayers: currentPlayers,
        totalPlayers: currentPlayers,
        currentDateTime: currentDateTime,
        image: image,
      });

      console.log(`Server ${name} registered in the database.`);
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
      if (!serversList.find((s) => s.name === server.name)) {
        console.log(`Server ${server.name} not found in the servers list.`);
        await server.deleteOne();
      }
    }
  }

  // Get server data
  static async getServerData(name: String, address: String) {
    const server = await ServerModel.findOne({
      address: address,
    });

    // If server not found, ping it
    if (!server) {
      await this.pingServer(name, "", 25565, 0, "");
      return;
    }
    return server;
  }
}

export default MongoService;
