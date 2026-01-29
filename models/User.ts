import mongoose, { Schema, type Document, type Model } from 'mongoose'

export interface IUser extends Document {
  fid: number
  onboarded: boolean
  humanId: string | null
  humanIdMinted: boolean
  humanScore: number
  humanDetails?: {
    followers: number
    following: number
    casts: number
    likes: number
    comments: number
    accountAgeDays: number
    neynarScore: number
    walletBalanceEth: number
    spamLabel: number
  }
  points: number
  createdAt?: Date
  updatedAt?: Date
}

const UserSchema = new Schema<IUser>(
  {
    fid: { type: Number, index: true, unique: true, required: true },
    onboarded: { type: Boolean, default: false },
    humanId: { type: String, default: null },
    humanIdMinted: { type: Boolean, default: false },
    humanScore: { type: Number, default: 0 },
    humanDetails: {
      followers: { type: Number, default: 0 },
      following: { type: Number, default: 0 },
      casts: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      accountAgeDays: { type: Number, default: 0 },
      neynarScore: { type: Number, default: 0 },
      walletBalanceEth: { type: Number, default: 0 },
      spamLabel: { type: Number, default: 0 },
    },
    points: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const UserModel: Model<IUser> =
  mongoose.models.RetroUser || mongoose.model<IUser>('RetroUser', UserSchema)
