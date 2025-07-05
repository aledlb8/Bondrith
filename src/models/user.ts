import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  id: number;
  secret: string;
  ip: string | undefined;
  hwid: string | undefined;
  discordId: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  secret: {
    type: String,
    required: true,
    unique: true,
  },
  ip: String,
  hwid: String,
  discordId: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
export type { IUser };
