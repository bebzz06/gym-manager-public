import { Request, Response } from 'express';
import User from '@models/User.model.js';
import { IUser } from '@/types/user.types.js';
import mongoose from 'mongoose';
import { calculateAge } from '@shared/utils/age.js';
import { invalidateUserSessions } from '@/services/v1/auth/session.service.js';
import {
  validateUserEditPermissions,
  validateFieldEditPermissions,
  validateGymOwner,
} from '@/services/v1/auth/permission.service.js';
import { getEditableFields } from '@/utils/index.js';
import _ from 'lodash';
import { TSubscriptionStatus } from '@shared/types/subscription.types.js';
import { UserRole } from '@shared/constants/user.js';
import { TUserRole } from '@shared/types/user.types.js';
import Gym from '@models/Gym.model.js';
import { formatDatesInObject } from '@/utils/index.js';

export const createMember = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      dateOfBirth,
      phoneNumber,
      role,
      guardian,
      emergencyContact,
    } = req.body;
    // Validate required fields
    if (!firstName || !lastName || !email || !dateOfBirth || !role) {
      return res.status(400).json({
        message: 'Please provide all required fields',
      });
    }

    // Check if trying to create an owner
    if (role === UserRole.OWNER) {
      const gymId = (req.user as IUser).gym;
      const isOwnerValid = await validateGymOwner(gymId.toString());
      if (!isOwnerValid) {
        return res.status(400).json({
          success: false,
          message: 'A gym can only have one owner. Please remove the existing owner first.',
        });
      }
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: 'Email already registered',
      });
    }

    const age = calculateAge(dateOfBirth);

    // Validate guardian information for minors
    if (age < 18 && !guardian) {
      return res.status(400).json({
        message: 'Guardian information is required for members under 18',
      });
    }

    const member = await User.create({
      firstName,
      lastName,
      email,
      dateOfBirth,
      phoneNumber,
      role,
      guardian: age < 18 ? guardian : undefined,
      emergencyContact: emergencyContact || (age < 18 ? guardian : undefined),
      createdBy: (req.user as IUser)?._id,
      gym: (req.user as IUser)?.gym,
    });

    res.status(201).json({
      message: 'Member registration successful.',
      user: {
        id: member._id,
        email: member.email,
        firstName: member.firstName,
        lastName: member.lastName,
      },
    });
  } catch (error) {
    console.error('Member creation error:', error);
    res.status(500).json({
      message: 'Error creating member. Please try again.',
    });
  }
};

export const searchGuardian = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email is required' });
    }

    const potentialGuardian = await User.findPotentialGuardian(email);

    if (!potentialGuardian) {
      return res.status(404).json({ message: 'No eligible guardian found with this email' });
    }

    res.status(200).json({
      guardian: {
        id: potentialGuardian._id,
        firstName: potentialGuardian.firstName,
        lastName: potentialGuardian.lastName,
        email: potentialGuardian.email,
        phoneNumber: potentialGuardian.phoneNumber,
      },
    });
  } catch (error) {
    console.error('Guardian search error:', error);
    res.status(500).json({ message: 'Error searching for guardian' });
  }
};

type PopulatedMembershipStatus = IUser & {
  activeMembershipPlan?: {
    payment?: {
      subscription?: {
        status: TSubscriptionStatus;
        endDate: Date;
      };
    };
  };
};

export const getMembers = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const { roles } = req.query;
    const gym = await Gym.findById(user.gym).select('address.timezone');
    const timezone = gym?.address?.timezone || 'UTC';

    const query: { gym: mongoose.Types.ObjectId; isDeleted: boolean; role?: { $in: TUserRole[] } } =
      {
        gym: user.gym,
        isDeleted: false,
      };

    const requestedRoles = (
      typeof roles === 'string' ? roles.split(',') : (roles as string[]) || []
    )
      .map(role => role.toUpperCase().trim())
      .filter(role => Object.values(UserRole).includes(role as TUserRole)) as TUserRole[];

    query.role = {
      $in: requestedRoles.length > 0 ? requestedRoles : [UserRole.MEMBER],
    };

    let userQuery = User.find(query).select(
      'firstName lastName email rank isEmailVerified dateOfBirth role profileImage'
    );

    // Only populate membership data if we're querying for MEMBER role
    if (requestedRoles.includes(UserRole.MEMBER) || requestedRoles.length === 0) {
      userQuery = userQuery.populate({
        path: 'activeMembershipPlan.payment',
        select: 'subscription.status subscription.endDate',
      });
    }

    const members = (await userQuery.lean({ virtuals: true })) as PopulatedMembershipStatus[];

    const sanitizedMembers = members.map(member => {
      const baseData = {
        id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        rank: member.rank,
        role: member.role,
        isEmailVerified: member.isEmailVerified,
        age: member.age,
        ageCategory: member.ageCategory,
        profileImage: member.profileImage,
      };

      // Add membership info only for members
      if (member.role === UserRole.MEMBER) {
        const formattedDates = formatDatesInObject(member, timezone, [
          'activeMembershipPlan.payment.subscription.endDate',
        ]);
        return {
          ...baseData,
          membershipInfo: {
            status: member.activeMembershipPlan?.payment?.subscription?.status || null,
            endDate: formattedDates.activeMembershipPlan?.payment?.subscription?.endDate || null,
          },
        };
      }

      return baseData;
    });

    res.status(200).json({ members: sanitizedMembers });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: 'Error fetching members' });
  }
};

export const getMemberById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const editor = req.user as IUser;
    const gym = await Gym.findById(editor.gym).select('address.timezone');
    const timezone = gym?.address?.timezone || 'UTC';

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid member ID format',
      });
    }

    const member = await User.findOne({
      _id: id,
      gym: editor.gym,
      isDeleted: false,
    }).select(
      '-password -__v -gym -isDeleted -deletedAt -deletedBy -createdAt -updatedAt -createdBy -updatedBy -tokenVersion -isEmailVerified -profileImage'
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    const editableFields = getEditableFields(editor, member);
    const membershipInfo = await member.getMembershipInfo();
    const paymentHistory = await member.getPaymentHistory();

    const formattedMembershipInfo = formatDatesInObject(membershipInfo, timezone, [
      'endDate',
      'startDate',
      'lastPayment',
    ]);

    const formattedPaymentHistory = {
      ...paymentHistory,
      payments: paymentHistory.payments.map(payment =>
        formatDatesInObject(payment, timezone, ['createdAt'])
      ),
    };

    const sanitizedMember = {
      id: member._id,
      ...member.toObject(),
      _id: undefined,
      activeMembershipPlan: undefined,
      membershipInfo: formattedMembershipInfo,
      paymentHistory: formattedPaymentHistory,
    };

    res.status(200).json({
      success: true,
      member: sanitizedMember,
      editableFields,
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching member details',
    });
  }
};

export const updateMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const editor = req.user as IUser;
    const withUpdates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid member ID format',
      });
    }

    // Find member and verify gym association
    const targetUser = await User.findOne({
      _id: id,
      gym: editor.gym,
      isDeleted: false,
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    // Check general edit permissions
    const hasEditPermission = await validateUserEditPermissions(editor, targetUser);
    if (!hasEditPermission) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this member',
      });
    }

    if (withUpdates.role === UserRole.OWNER) {
      const isOwnerValid = await validateGymOwner(editor.gym.toString(), id);
      if (!isOwnerValid) {
        return res.status(400).json({
          success: false,
          message: 'A gym can only have one owner. Please remove the existing owner first.',
        });
      }
    }

    // Normalize dates in withUpdates
    if (withUpdates.dateOfBirth) {
      withUpdates.dateOfBirth = new Date(withUpdates.dateOfBirth);
    }

    const updates: Partial<IUser> = {};

    for (const field of Object.keys(withUpdates)) {
      const key = field as keyof IUser;
      const newValue = withUpdates[key];
      const currentValue = targetUser.toObject()[key];

      // Skip undefined values
      if (newValue === undefined) continue;

      const hasChanged = !_.isEqual(newValue, currentValue);

      // Only check permissions if the field has actually changed
      if (hasChanged) {
        const canEditField = await validateFieldEditPermissions(editor, targetUser, field);

        if (!canEditField) {
          return res.status(403).json({
            success: false,
            message: `You do not have permission to modify ${field}`,
          });
        }

        updates[key] = newValue;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No changes to update',
        member: targetUser,
      });
    }

    const isEmailUpdated = updates.email && updates.email !== targetUser.email;

    if (isEmailUpdated) {
      const emailExists = await User.findOne({ email: updates.email, _id: { $ne: id } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
      }
      // Invalidate member's sessions
      await invalidateUserSessions(id);
    }

    // Validate guardian information for minors
    const isEmergencyContactIncomplete =
      updates.emergencyContact &&
      (!updates.emergencyContact?.firstName ||
        !updates.emergencyContact?.lastName ||
        !updates.emergencyContact?.phoneNumber ||
        !updates.emergencyContact?.relationship);

    if (targetUser.age && targetUser.age < 18 && isEmergencyContactIncomplete) {
      return res.status(400).json({
        success: false,
        message: 'Emergency contact information is required for members under 18',
      });
    }

    // if member is under 18 and emergency contact is provided, sync with guardian
    if (targetUser.age && targetUser.age < 18 && updates.emergencyContact) {
      updates.guardian = updates.emergencyContact;
    }

    if (isEmailUpdated) {
      updates.isEmailVerified = false;
    }

    const updatedMember = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updates,
          updatedBy: editor._id,
        },
      },
      { new: true }
    ).select('-password -__v -role -gym');

    if (!updatedMember) {
      return res.status(404).json({
        success: false,
        message: 'Member not found after update',
      });
    }

    const sanitizedMember = {
      id: updatedMember._id,
      ...updatedMember.toObject(),
      _id: undefined,
    };

    if (isEmailUpdated) {
      res.status(200).json({
        success: true,
        message:
          'Member updated successfully. Member will need to log in again with their new email.',
        member: sanitizedMember,
        emailUpdated: true,
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'Member updated successfully',
        member: sanitizedMember,
        emailUpdated: false,
      });
    }
  } catch (error) {
    console.error('Member update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating member',
    });
  }
};

export const deleteMember = async (req: Request, res: Response) => {
  //todo: cleanup of member records like payments, attendance, etc.
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid member ID format',
      });
    }

    const member = await User.findOne({
      _id: id,
      gym: (req.user as IUser)?.gym,
      isDeleted: false,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    //soft delete
    const updatedMember = await User.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: (req.user as IUser)?._id,
      },
      { new: true }
    );

    if (!updatedMember) {
      return res.status(404).json({
        success: false,
        message: 'Member not found after deletion',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Member deleted successfully',
    });
  } catch (error) {
    console.error('Member deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting member',
    });
  }
};

export const searchMembers = async (req: Request, res: Response) => {
  try {
    const { query, roles } = req.query;
    const gymId = (req.user as IUser).gym;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    // Handle roles - split if it's a comma-separated string
    const rolesCriteria = roles
      ? typeof roles === 'string'
        ? roles.split(',')
        : Array.isArray(roles)
          ? roles
          : [roles]
      : Object.values(UserRole);

    // Normalize the search query
    const normalizedQuery = query.toLowerCase().trim();
    const searchTerms = normalizedQuery.split(' ').filter(term => term.length > 0);

    const searchCriteria = {
      gym: gymId,
      isDeleted: false,
      role: { $in: rolesCriteria },
      $or: [
        // Prefix match on first name or last name
        { firstName: { $regex: `^${normalizedQuery}`, $options: 'i' } },
        { lastName: { $regex: `^${normalizedQuery}`, $options: 'i' } },

        // Contains match on full name
        { firstName: { $regex: normalizedQuery, $options: 'i' } },
        { lastName: { $regex: normalizedQuery, $options: 'i' } },

        // Match multiple terms against first and last names
        ...(searchTerms.length > 1
          ? [
              // Match terms in any order
              {
                $and: searchTerms.map(term => ({
                  $or: [
                    { firstName: { $regex: term, $options: 'i' } },
                    { lastName: { $regex: term, $options: 'i' } },
                  ],
                })),
              },
            ]
          : []),
      ],
    };

    const members = await User.find(searchCriteria)
      .select('firstName lastName email role')
      .limit(10)
      .lean();

    const sanitizedMembers = members.map(member => ({
      id: member._id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      role: member.role, // Include role in response
    }));

    res.status(200).json({
      success: true,
      members: sanitizedMembers,
    });
  } catch (error) {
    console.error('Member search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching for members',
    });
  }
};
