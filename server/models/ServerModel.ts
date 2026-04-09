import mongoose, { Document, Schema } from "mongoose";

interface IServer extends Document {
  name: String;
  address: String;
  port: Number;
  maxPlayers: Number;
  totalPlayers: Number;
  image: String;
  motd: String;
  ping: Array<{ currentPlayers: Number; timestamp: Number }>;
  uptimeStats: {
    totalChecks: number;
    successfulChecks: number;
    firstCheckAdded: Number;
  };
  dailyMetrics: Array<{ timestamp: Number; maxPlayers: Number; averagePlayers: Number }>;
  last24hAveragePlayers: Number;
  allTimeAveragePlayers: Number;
}

const serverSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  port: { type: Number, required: false },
  maxPlayers: { type: Number, required: true },
  totalPlayers: { type: Number, required: false },
  image: { type: String, required: false },
  motd: { type: String, required: false },
  ping: { type: Array, required: false },
  uptimeStats: {
    totalChecks: { type: Number, default: 0 },
    successfulChecks: { type: Number, default: 0 },
    firstCheckAdded: { type: Number, default: Date.now },
  },
  dailyMetrics: { type: Array, required: false, default: [] },
  last24hAveragePlayers: { type: Number, required: false, default: 0 },
  allTimeAveragePlayers: { type: Number, required: false, default: 0 },
});

const Server = mongoose.model<IServer>("Server", serverSchema);

export default Server;
