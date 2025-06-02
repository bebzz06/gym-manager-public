import mongoose, { Schema } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import { IUser, IUserModel, IMembershipInfo } from '@/types/user.types.js';
import { hashPassword, comparePasswords } from '@/services/v1/auth/password.service.js';
import { calculateAge, determineAgeCategory } from '@shared/utils/age.js';
import { validateBeltForAgeCategory } from '@/services/v1/user/belt.service.js';
import { validateUserCreationPermissions } from '@/services/v1/auth/permission.service.js';
import { prepareUserCreation } from '@/services/v1/user/creation.service.js';
import {
  UserRole,
  Belt,
  KidsBelt,
  AgeCategory,
  EmergencyContactRelationshipToMember,
} from '@shared/constants/user.js';
import { TUserRole } from '@shared/types/user.types.js';
import { findPotentialGuardian } from '@/services/v1/user/guardian.service.js';
import { getMembershipInformation } from '@/services/v1/membership/membership.information.service.js';
import { getUserPaymentHistory } from '@/services/v1/payment/transaction.stats.service.js';
import { IPaymentHistoryResponse, IPaymentHistoryOptions } from '@/types/payment.history.types.js';
const emailSchema = {
  type: String,
  trim: true,
  lowercase: true,
  unique: false,
};
const userSchema = new Schema<IUser>(
  {
    gym: {
      type: Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    profileImage: {
      type: {
        url: String,
        path: String,
      },
      default: null,
    },
    email: {
      ...emailSchema,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      validate: {
        validator: async function (this: IUser) {
          return validateUserCreationPermissions(this);
        },
        message:
          'Password is required for self-registration. Invalid role combination for user creation.',
      },
      default: null,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.OWNER,
    },

    phoneNumber: {
      type: String,
      default: null,
    },
    emergencyContact: {
      firstName: String,
      lastName: String,
      email: emailSchema,
      phoneNumber: String,
      relationship: {
        type: String,
        enum: Object.values(EmergencyContactRelationshipToMember),
      },
    },
    dateOfBirth: {
      type: Date,
      required: function (this: IUser) {
        const exemptRoles: TUserRole[] = [UserRole.OWNER, UserRole.ADMIN, UserRole.STAFF];
        return !exemptRoles.includes(this.role);
      },
      validate: {
        validator: function (dob: Date) {
          // Ensure date is not in the future
          return dob <= new Date();
        },
        message: 'Date of birth cannot be in the future',
      },
    },
    guardian: {
      type: {
        firstName: String,
        lastName: String,
        email: emailSchema,
        phoneNumber: String,
        relationship: String,
      },
      required: function (this: IUser) {
        const exemptRoles: TUserRole[] = [UserRole.OWNER, UserRole.ADMIN, UserRole.STAFF];
        return !exemptRoles.includes(this.role) && this.age && this.age < 18;
      },
    },
    rank: {
      belt: {
        type: String,
        enum: {
          values: [...Object.values(Belt), ...Object.values(KidsBelt)],
          message: 'Invalid belt for age category',
        },
        default: function (this: IUser) {
          const exemptRoles: TUserRole[] = [UserRole.OWNER, UserRole.ADMIN, UserRole.STAFF];
          if (exemptRoles.includes(this.role)) {
            return Belt.WHITE;
          }
          const ageCategory = this.getAgeCategory();
          return ageCategory === AgeCategory.KID ? KidsBelt.WHITE : Belt.WHITE;
        },
      },
      stripes: {
        type: Number,
        min: 0,
        max: 4,
        default: 0,
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    //tracking jwtoken version
    tokenVersion: {
      type: Number,
      default: 0,
    },
    //token for email verification link
    emailVerification: {
      type: {
        token: String,
        expiresAt: Date,
        isUsed: Boolean,
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    //token for password reset link
    passwordReset: {
      type: {
        token: String,
        expiresAt: Date,
        isUsed: Boolean,
      },
    },
    activeMembershipPlan: {
      plan: {
        type: Schema.Types.ObjectId,
        ref: 'MembershipPlan',
        default: null,
      },
      payment: {
        type: Schema.Types.ObjectId,
        ref: 'PaymentTransaction',
        default: null,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  if (this.password) {
    this.password = await hashPassword(this.password);
  }
  next();
});
// Pre-save middleware to prepare user creation
userSchema.pre('save', function (next) {
  prepareUserCreation(this);
  next();
});
// Pre-save middleware to validate belt based on age category
userSchema.pre('save', function (next) {
  const { isValid, defaultBelt } = validateBeltForAgeCategory(this);

  // If current belt is not valid for the age category
  if (!isValid) {
    // Reset to appropriate white belt and remove stripes
    this.rank.belt = defaultBelt;
    this.rank.stripes = 0;
  }

  next();
});

// instance methods
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  if (!this.password) return false;
  return comparePasswords(enteredPassword, this.password);
};

userSchema.methods.getGymInfo = function () {
  return mongoose.model('Gym').findById(this.gym);
};
userSchema.methods.getAgeCategory = function (): string | null {
  return this.age ? determineAgeCategory(this.age) : null;
};

userSchema.methods.getMembershipInfo = async function (): Promise<IMembershipInfo> {
  return getMembershipInformation(this as IUser);
};
userSchema.methods.getPaymentHistory = async function (
  options: IPaymentHistoryOptions = {}
): Promise<IPaymentHistoryResponse> {
  return getUserPaymentHistory(this._id, options);
};

// Virtual for age
userSchema.virtual('age').get(function (this: IUser) {
  return this.dateOfBirth ? calculateAge(this.dateOfBirth) : null;
});

// Virtual for age category
userSchema.virtual('ageCategory').get(function (this: IUser) {
  const age = calculateAge(this.dateOfBirth);
  return determineAgeCategory(age);
});

//static method
userSchema.statics.findPotentialGuardian = async function (email: string) {
  return findPotentialGuardian(email);
};

userSchema.index({ gym: 1, role: 1 });
userSchema.plugin(mongooseLeanVirtuals);

export default mongoose.model<IUser, IUserModel>('User', userSchema);
