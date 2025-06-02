import { IUser } from '@/types/user.types.js';
import { TSubscriptionStatus } from '@shared/types/subscription.types.js';
import { Types } from 'mongoose';
import { IMembershipInfo } from '@/types/user.types.js';

interface IPopulatedPayment {
  createdAt: Date;
  subscription: {
    status: TSubscriptionStatus;
    endDate: Date;
  };
}

interface IPopulatedUser extends Omit<IUser, 'activeMembershipPlan'> {
  activeMembershipPlan: {
    payment: IPopulatedPayment;
    plan: {
      _id: Types.ObjectId;
      name: string;
    };
  };
}

export const getMembershipInformation = async (user: IUser): Promise<IMembershipInfo> => {
  const populatedUser = (await user.populate([
    {
      path: 'activeMembershipPlan.payment',
      select: 'createdAt subscription.status subscription.endDate',
    },
    {
      path: 'activeMembershipPlan.plan',
      select: 'name',
    },
  ])) as IPopulatedUser;

  if (!populatedUser.activeMembershipPlan?.payment?.subscription) {
    return {
      status: null,
      endDate: null,
      lastPayment: null,
      plan: null,
    };
  }

  const lastPayment = populatedUser.activeMembershipPlan.payment.createdAt;
  const { status, endDate } = populatedUser.activeMembershipPlan.payment.subscription;
  const plan = populatedUser.activeMembershipPlan.plan
    ? {
        id: populatedUser.activeMembershipPlan.plan._id,
        name: populatedUser.activeMembershipPlan.plan.name,
      }
    : null;

  return {
    status,
    endDate,
    lastPayment,
    plan,
  };
};
