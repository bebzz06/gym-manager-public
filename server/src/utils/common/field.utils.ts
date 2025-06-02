import { IUser } from '@/types/user.types.js';
import { UserRole } from '@shared/constants/user.js';

const MEMBER_EDITABLE_FIELDS = ['email', 'phoneNumber', 'emergencyContact'];
const STAFF_EDITABLE_FIELDS = [...MEMBER_EDITABLE_FIELDS];
const ADMIN_EDITABLE_FIELDS = [...STAFF_EDITABLE_FIELDS, 'rank', 'role'];
const OWNER_EDITABLE_FIELDS = [...ADMIN_EDITABLE_FIELDS];

const ROLE_EDITABLE_FIELDS = {
  [UserRole.OWNER]: OWNER_EDITABLE_FIELDS,
  [UserRole.ADMIN]: ADMIN_EDITABLE_FIELDS,
  [UserRole.STAFF]: STAFF_EDITABLE_FIELDS,
  [UserRole.MEMBER]: MEMBER_EDITABLE_FIELDS,
};

export const getEditableFields = (editor: IUser, targetUser: IUser): string[] => {
  // If editing someone else with same/higher role, return empty array
  if (
    editor.id !== targetUser.id &&
    Object.values(UserRole).indexOf(editor.role) >= Object.values(UserRole).indexOf(targetUser.role)
  ) {
    return [];
  }
  return ROLE_EDITABLE_FIELDS[editor.role];
};
