// MongoDB package
import mongoose from "mongoose";

// Models
import ServerModel from "../models/ServerModel";

// Dotenv
import dotenv from "dotenv";
dotenv.config();

class MongoService {
  // Connect to MongoDB
  static async connect(uri: string) {
    console.log(`Connecting to MongoDB at ${uri}`);

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
    currentPlayers: Number,
    image: String
  ) {
    var server = await ServerModel.findOne({ name: name });
    let currentDateTime = new Date().getTime() as Number;

    if (!server) {
      console.error(
        `Server ${name} not found... Registering it in the database.`
      );

      server = new ServerModel({
        name: name,
        address: address,
        maxPlayers: currentPlayers,
        totalPlayers: currentPlayers,
        currentDateTime: currentDateTime,
        image: image,
      });

      console.log(`Server ${name} registered in the database.`);
    }

    // Update address
    server.address = address;

    if (server.ping.length >= 100)
      server.ping = server.ping.slice(server.ping.length - 99);

    server.ping.push({
      currentPlayers: currentPlayers,
      timestamp: currentDateTime,
    });

    // Update server image
    server.image = image;

    // Update server currentDateTime if not exist
    if (server.currentDateTime === undefined)
      server.currentDateTime = currentDateTime;

    // Update today's max players, if date is passed 24 hours, reset it
    if (
      Number(currentDateTime) - Number(server.currentDateTime) >
      24 * 60 * 60 * 1000
    ) {
      server.currentDateTime = currentDateTime;
      server.maxPlayers = currentPlayers;
    }

    if (server.maxPlayers === undefined) server.maxPlayers = 0;
    if (currentPlayers > server.maxPlayers) server.maxPlayers = currentPlayers;

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
  static async getServerData(name: String) {
    const server = await ServerModel.findOne({
      name: name,
    });

    // If server not found, ping it
    if (!server) this.pingServer(name, "", 0, "");
    return server;
  }
}

export default MongoService;
