import mongoose, { Document, Schema } from "mongoose";

interface IServer extends Document {
  name: String;
  address: String;
  maxPlayers: Number;
  totalPlayers: Number;
  image: String;
  ping: Array<{ currentPlayers: Number; timestamp: Number }>;
}

const serverSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  maxPlayers: { type: Number, required: true },
  totalPlayers: { type: Number, required: false },
  image: { type: String, required: false },
  ping: { type: Array, required: false },
});

const Server = mongoose.model<IServer>("Server", serverSchema);

export default Server;
