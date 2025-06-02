import mongoose, { Schema } from 'mongoose';
import { IGym } from '@/types/gym.types.js';
import { UserRole } from '@shared/constants/user.js';
import { SubscriptionStatus } from '@shared/constants/subscription.js';
import countries from 'i18n-iso-countries';
import { determineTimezone } from '@/middleware/common/timezone.middleware.js';
import { logger } from '@/utils/index.js';
import { MULTI_TIMEZONE_COUNTRIES } from '@shared/constants/countries.js';

const addressSchema = new Schema(
  {
    addressLine1: {
      type: String,
      default: null,
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
      default: null,
    },
    city: {
      type: String,
      default: null,
      trim: true,
    },
    region: {
      type: String,
      default: null,
      trim: true,
    },
    postalCode: {
      type: String,
      default: null,
      trim: true,
    },
    country: {
      type: String,
      enum: {
        values: Object.keys(countries.getAlpha2Codes()).filter(
          code => !MULTI_TIMEZONE_COUNTRIES.includes(code)
        ),
        message: '{VALUE} is not a supported country code',
      },
      required: [true, 'Country is required'],
      trim: true,
      immutable: true,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
  },
  { _id: false }
);

const gymSchema = new Schema<IGym>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: addressSchema,
      required: true,
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscriptionStatus: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.TRIAL,
    },
    subscriptionEndDate: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    logo: {
      type: {
        url: String,
        path: String,
      },
      default: null,
    },
    website: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

gymSchema.index({ name: 1, isActive: 1 });
gymSchema.pre('save', async function (next) {
  // Only determine timezone if the gym is new
  if (this.isNew) {
    try {
      const timezoneResult = await determineTimezone({
        city: this.address.city,
        country: this.address.country,
        postalCode: this.address.postalCode,
        region: this.address.region,
      });

      this.address.timezone = timezoneResult.timezone;
    } catch (error) {
      logger.error('Error determining timezone:', error);
      this.address.timezone = 'UTC';
    }
  }
  next();
});

// Helper methods
gymSchema.methods.getMembers = function () {
  return mongoose.model('User').find({ gym: this._id, role: UserRole.MEMBER });
};

gymSchema.methods.getStaffAdmins = function () {
  return mongoose.model('User').find({ gym: this._id, role: UserRole.STAFF });
};

gymSchema.methods.getAdmins = function () {
  return mongoose.model('User').find({
    gym: this._id,
    role: { $in: [UserRole.ADMIN, UserRole.OWNER] },
  });
};

export default mongoose.model<IGym>('Gym', gymSchema);
