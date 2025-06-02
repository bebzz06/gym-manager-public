import mongoose, { Schema } from 'mongoose';
import { MembershipType } from '@shared/constants/user.js';
import { IMembershipPlan } from '@/types/membership.plan.types.js';
import { SubscriptionInterval } from '@shared/constants/subscription.js';
import { PaymentMethods, PaymentTransactionTypes } from '@shared/constants/payment.js';
import { TPaymentMethod } from '@shared/types/payment.types.js';

const membershipPlanSchema = new Schema(
  {
    gym: {
      type: Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    itemType: {
      type: String,
      enum: Object.values(PaymentTransactionTypes),
      required: true,
      default: PaymentTransactionTypes.MEMBERSHIP_PLAN,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(MembershipType),
      required: true,
    },

    pricing: {
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        default: 'USD',
      },
      interval: {
        type: String,
        enum: Object.values(SubscriptionInterval),
        required: true,
      },
      intervalCount: {
        type: Number,
        default: 1,
        min: 1,
      },
      tax: {
        enabled: {
          type: Boolean,
          default: false,
        },
        rate: {
          type: Number,
          default: 0,
          min: [0, 'Tax rate cannot be negative'],
          max: [1, 'Tax rate cannot be greater than 100%'],
          validate: {
            validator: function (v: number) {
              return !isNaN(v) && v >= 0 && v <= 1;
            },
            message: (props: { value: number }) =>
              `${props.value} is not a valid tax rate! Must be between 0 and 1`,
          },
        },
      },
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    trial: {
      enabled: {
        type: Boolean,
        default: false,
      },
      days: {
        type: Number,
        default: 0,
      },
    },
    contractLength: {
      type: Number, // in months, 0 for no contract
      default: 0,
    },
    maxMembers: {
      type: Number, // limit number of members, null for unlimited
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    //Automatically supports new payment processors
    paymentMethodSettings: {
      type: Object,
      default: {},
      validate: {
        validator: function (methods: Record<string, any>) {
          // Validate that at least one payment method is enabled
          const hasEnabledMethod = Object.values(methods).some(value => value.enabled);
          if (!hasEnabledMethod) return false;

          // Validate each provided method's structure
          return Object.entries(methods).every(([key, value]) => {
            if (!Object.values(PaymentMethods).includes(key as TPaymentMethod)) return false;
            if (typeof value !== 'object' || value.enabled === undefined) return false;

            if (key === PaymentMethods.CASH) {
              return typeof value.instructions === 'string' && !value.credentials;
            } else {
              return (
                !value.enabled || (typeof value.credentials === 'object' && !value.instructions)
              );
            }
          });
        },
        message: 'Invalid payment method settings structure',
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
membershipPlanSchema.index({ gym: 1, name: 1 }, { unique: true });
membershipPlanSchema.index({ gym: 1, category: 1 });
membershipPlanSchema.index({ isActive: 1 });

export default mongoose.model<IMembershipPlan>('MembershipPlan', membershipPlanSchema);
