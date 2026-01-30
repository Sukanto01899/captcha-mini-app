import mongoose, { Schema, type Document, type Model } from 'mongoose'

export interface IAirdropConfig extends Document {
  key: string
  tokenName: string
  poolAmount: string
  claimAmount: string
  minPoints: number
  minScore: number
  maxClaimsPerUser: number
  requireHumanId: boolean
  paused: boolean
  updatedBy?: number
  createdAt?: Date
  updatedAt?: Date
}

const AirdropConfigSchema = new Schema<IAirdropConfig>(
  {
    key: { type: String, unique: true, default: 'active' },
    tokenName: { type: String, default: '' },
    poolAmount: { type: String, default: '0' },
    claimAmount: { type: String, default: '0' },
    minPoints: { type: Number, default: 0 },
    minScore: { type: Number, default: 0 },
    maxClaimsPerUser: { type: Number, default: 1 },
    requireHumanId: { type: Boolean, default: false },
    paused: { type: Boolean, default: false },
    updatedBy: { type: Number, default: null },
  },
  { timestamps: true },
)

export const AirdropConfigModel: Model<IAirdropConfig> =
  mongoose.models.AirdropConfig ||
  mongoose.model<IAirdropConfig>('AirdropConfig', AirdropConfigSchema)
