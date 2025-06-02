import { IRegistrationLink } from '@/types/registration.link.types.js';
import { LinkStatus } from '@shared/constants/registration.link.js';
import mongoose, { Schema } from 'mongoose';

const registrationLinkSchema = new Schema<IRegistrationLink>({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  maxUses: {
    type: Number,
    default: null,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gym: {
    type: Schema.Types.ObjectId,
    ref: 'Gym',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: Object.values(LinkStatus),
    default: LinkStatus.ACTIVE,
  },
  revokedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  revokedAt: {
    type: Date,
    default: null,
  },
});

export default mongoose.model('RegistrationLink', registrationLinkSchema);

//I don't need the checking for expired links in the pre save middleware since I don't need real time updates.
