import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IUser extends Document {
  fid: number;
  onboarded: boolean;
  humanId: string | null;
  points: number;
  livesRemaining: number;
  lastCaptchaAt?: Date | null;
  nextCaptchaAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fid: { type: Number, index: true, unique: true, required: true },
    onboarded: { type: Boolean, default: false },
    humanId: { type: String, default: null },
    points: { type: Number, default: 0 },
    livesRemaining: { type: Number, default: 4 },
    lastCaptchaAt: { type: Date, default: null },
    nextCaptchaAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const UserModel: Model<IUser> =
  mongoose.models.RetroUser || mongoose.model<IUser>("RetroUser", UserSchema);
