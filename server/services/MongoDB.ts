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

    await mongoose.connect(uri, options);
    console.log("Connected to MongoDB");
  }

  // Ping server
  static async pingServer(
    name: String,
    address: String,
    port: Number,
    currentPlayers: Number,
    image: String,
    motd: String,
    platform: Platform,
    isOnline: boolean = false,
  ) {
    let server = await MongoService.getServerData(address);
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
        uptimeStats: {
          totalChecks: 0,
          successfulChecks: 0,
          firstCheckAdded: Date.now(),
        },
        dailyMetrics: [],
        last24hAveragePlayers: 0,
      });
    }

    // Update uptime stats
    if (!server.uptimeStats) {
      server.uptimeStats = {
        totalChecks: 0,
        successfulChecks: 0,
        firstCheckAdded: Date.now(),
      };
    }
    server.uptimeStats.totalChecks += 1;
    if (isOnline) server.uptimeStats.successfulChecks += 1;

    // Update address
    server.address = address;

    // Update port
    if (port != 25565 && port != 5520) server.port = port;

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
    let total24hPlayers = 0 as number;

    server.ping.forEach((ping) => {
      total24hPlayers += Number(ping.currentPlayers);
      if (ping.currentPlayers > currentMaxPlayers)
        currentMaxPlayers = ping.currentPlayers;
    });

    server.maxPlayers = currentMaxPlayers;
    if (server.ping.length > 0) {
      server.last24hAveragePlayers = Math.round(
        total24hPlayers / server.ping.length,
      );
    } else {
      server.last24hAveragePlayers = 0;
    }

    // Timestamp
    const now = new Date();
    const startOfDay = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    ).getTime();

    if (!server.dailyMetrics) {
      server.dailyMetrics = [];
    }

    const todayMetricIndex = server.dailyMetrics.findIndex(
      (m: any) => m.timestamp === startOfDay,
    );

    if (todayMetricIndex !== -1) {
      if (currentPlayers > server.dailyMetrics[todayMetricIndex].maxPlayers) {
        server.dailyMetrics[todayMetricIndex].maxPlayers = currentPlayers;
      }

      server.dailyMetrics[todayMetricIndex].averagePlayers =
        server.last24hAveragePlayers;
      server.markModified("dailyMetrics");
    } else {
      server.dailyMetrics.push({
        timestamp: startOfDay,
        maxPlayers: currentPlayers,
        averagePlayers: currentPlayers,
      });
    }

    if (server.dailyMetrics && server.dailyMetrics.length > 0) {
      const allTimeAvgSum = server.dailyMetrics.reduce(
        (sum, m) => sum + (Number(m.averagePlayers) || 0),
        0,
      );
      server.allTimeAveragePlayers = Math.round(
        allTimeAvgSum / server.dailyMetrics.length,
      );
    } else {
      server.allTimeAveragePlayers = currentPlayers;
    }

    // Update total players
    if (server.totalPlayers === undefined) server.totalPlayers = 0;
    if (server.totalPlayers < currentPlayers)
      server.totalPlayers = currentPlayers;

    await server.save();
  }

  // Delete servers that are not in the servers list
  static async removeInvalidServers(serversList: Array<{ address: string }>) {
    const validAddresses = new Set(serversList.map((s) => s.address));

    await ServerModel.deleteMany({
      address: { $nin: [...validAddresses] },
    });
  }

  static async getServerData(address: String) {
    return ServerModel.findOne({ address });
  }
}

export default MongoService;
