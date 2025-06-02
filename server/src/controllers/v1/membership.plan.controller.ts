import { Request, Response } from 'express';
import MembershipPlan from '@/models/MembershipPlan.model.js';
import { IUser } from '@/types/user.types.js';
import { validateMembershipPlan } from '@/services/v1/membership/validation.service.js';
import { UserRole } from '@shared/constants/user.js';

export const createMembershipPlan = async (req: Request, res: Response) => {
  try {
    const validation = validateMembershipPlan(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: `Invalid membership plan data, ${validation.errors.join(', ')}`,
        errors: validation.errors,
      });
    }

    const user = req.user as IUser;
    const {
      name,
      description,
      category,
      pricing,
      features,
      trial,
      contractLength,
      maxMembers,
      paymentMethodSettings,
    } = req.body;

    const existingPlan = await MembershipPlan.findOne({
      gym: user.gym,
      name: name,
    });

    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: 'A membership plan with this name already exists',
      });
    }

    const membershipPlan = await MembershipPlan.create({
      gym: user.gym,
      name,
      description,
      category,
      pricing,
      features,
      trial,
      contractLength,
      maxMembers,
      paymentMethodSettings,
      createdBy: user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Membership plan created successfully',
      plan: membershipPlan,
    });
  } catch (error) {
    console.error('Membership plan creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating membership plan',
    });
  }
};

export const getMembershipPlans = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;

    const baseQuery = { gym: user.gym };
    const isAdminOrOwner = user.role === UserRole.OWNER || user.role === UserRole.ADMIN;

    const query = isAdminOrOwner ? baseQuery : { ...baseQuery, isActive: true };

    const membershipPlans = await MembershipPlan.find(query).sort({ createdAt: -1 }).lean();

    const sanitizedPlans = membershipPlans.map(plan => ({
      id: plan._id,
      itemType: plan.itemType,
      name: plan.name,
      description: plan.description,
      category: plan.category,
      pricing: plan.pricing,
      features: plan.features,
      trial: plan.trial,
      contractLength: plan.contractLength,
      maxMembers: plan.maxMembers,
      paymentMethodSettings: plan.paymentMethodSettings,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }));

    res.status(200).json({
      success: true,
      message: 'Membership plans retrieved successfully',
      plans: sanitizedPlans,
    });
  } catch (error) {
    console.error('Error fetching membership plans:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching membership plans',
    });
  }
};

export const toggleMembershipPlanStatus = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const { planId } = req.params;

    const plan = await MembershipPlan.findOne({
      _id: planId,
      gym: user.gym,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Membership plan not found',
      });
    }

    plan.isActive = !plan.isActive;
    await plan.save();

    res.status(200).json({
      success: true,
      message: `Membership plan ${plan.isActive ? 'activated' : 'deactivated'} successfully`,
      plan,
    });
  } catch (error) {
    console.error('Error toggling membership plan status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating membership plan status',
    });
  }
};
