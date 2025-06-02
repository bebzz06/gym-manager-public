import { IUser } from '@/types/user.types.js';
import { getEditableFields } from '@/utils/index.js';
import { UserRole } from '@shared/constants/user.js';
import mongoose from 'mongoose';
import User from '@/models/User.model.js';

export const validateUserCreationPermissions = async (user: IUser): Promise<boolean> => {
  if (!user.isModified('password')) {
    return true; // Skip validation if password isn't being modified
  }
  // Case 1: Self-registration (new user with no creator set yet)
  if (user.isNew && !user.createdBy) {
    // Allow OWNER creation during initial setup
    if (user.role === UserRole.OWNER) {
      return !!user.password;
    }
    return user.role === UserRole.MEMBER && !!user.password;
  }

  // Case 2: Created by another user
  const creator = await mongoose.model('User').findById(user.createdBy);
  if (!creator) {
    throw new Error('Invalid creator ID');
  }
  // Check role-based creation permissions
  const isOwnerCreating = creator.role === UserRole.OWNER;
  const isAdminCreatingAllowed =
    creator.role === UserRole.ADMIN &&
    (user.role === UserRole.STAFF || user.role === UserRole.MEMBER);
  const isStaffCreatingMember = creator.role === UserRole.STAFF && user.role === UserRole.MEMBER;
  // Password not required for users created by authorized staff
  return isOwnerCreating || isAdminCreatingAllowed || isStaffCreatingMember;
};

export const validateUserEditPermissions = async (
  editor: IUser,
  targetUser: IUser
): Promise<boolean> => {
  // Owner can edit everyone
  if (editor.role === UserRole.OWNER) {
    return true;
  }

  // Admin permissions
  if (editor.role === UserRole.ADMIN) {
    // Can edit themselves
    if (editor.id === targetUser.id) {
      return true;
    }
    // Can edit staff and members, but not other admins or owners
    return targetUser.role === UserRole.STAFF || targetUser.role === UserRole.MEMBER;
  }

  // Staff permissions
  if (editor.role === UserRole.STAFF) {
    // Can edit themselves
    if (editor.id === targetUser.id) {
      return true;
    }
    // Can only edit members, not other staff, admins, or owners
    return targetUser.role === UserRole.MEMBER;
  }

  // Members can only edit themselves
  if (editor.role === UserRole.MEMBER) {
    return editor.id === targetUser.id;
  }

  return false;
};

// Helper function to check if user can edit specific fields
export const validateFieldEditPermissions = async (
  editor: IUser,
  targetUser: IUser,
  field: string
): Promise<boolean> => {
  // First check if user has base permission to edit this field
  const editableFields = getEditableFields(editor, targetUser);
  if (!editableFields.includes(field) && !editableFields.includes('*')) {
    return false;
  }

  // Then apply additional restrictions for special fields
  const restrictedFields = ['role', 'rank'];
  if (restrictedFields.includes(field)) {
    return (
      editor.role === UserRole.OWNER ||
      (editor.role === UserRole.ADMIN && targetUser.role !== UserRole.ADMIN)
    );
  }

  return true;
};

export const validateGymOwner = async (gymId: string, excludeUserId?: string): Promise<boolean> => {
  const query = {
    gym: gymId,
    role: UserRole.OWNER,
    isDeleted: false,
    ...(excludeUserId && { _id: { $ne: excludeUserId } }),
  };

  const existingOwner = await User.findOne(query);
  return !existingOwner; // returns true if no owner exists
};
