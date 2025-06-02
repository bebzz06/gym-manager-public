import bcrypt from 'bcryptjs';
import User from '@models/User.model.js';
import { generateTokens } from '@/utils/index.js';
import { PASSWORD_MESSAGES } from '@shared/constants/messages.js';
import { invalidateUserSessions } from '@/services/v1/auth/session.service.js';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (
  enteredPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(enteredPassword, hashedPassword);
};

interface PasswordValidationResult {
  isValid: boolean;
  message?: string;
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const { MIN_LENGTH } = PASSWORD_MESSAGES.REQUIREMENTS;
  const { ERRORS } = PASSWORD_MESSAGES;

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!password) {
    return { isValid: false, message: ERRORS.REQUIRED };
  }

  if (password.length < MIN_LENGTH) {
    return { isValid: false, message: ERRORS.MIN_LENGTH(MIN_LENGTH) };
  }

  if (!hasUpperCase) {
    return { isValid: false, message: ERRORS.UPPERCASE };
  }

  if (!hasLowerCase) {
    return { isValid: false, message: ERRORS.LOWERCASE };
  }

  if (!hasNumbers) {
    return { isValid: false, message: ERRORS.NUMBER };
  }

  if (!hasSpecialChar) {
    return { isValid: false, message: ERRORS.SPECIAL_CHAR };
  }

  return { isValid: true };
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  const isSamePassword = await user.matchPassword(newPassword);
  if (isSamePassword) {
    throw new Error('New password must be different from current password');
  }

  //password validation
  const validation = validatePassword(newPassword);
  if (!validation.isValid) {
    throw new Error(validation.message);
  }

  user.$set('password', newPassword);
  await user.save({ validateBeforeSave: false });
  await invalidateUserSessions(user.id);
};

export const generatePasswordResetToken = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }
  const { publicToken: passwordResetToken } = generateTokens(email);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); //1 hour
  user.passwordReset = {
    token: passwordResetToken,
    expiresAt,
    isUsed: false,
  };
  await user.save();
  return {
    token: passwordResetToken,
  };
};

export const validatePasswordResetToken = async (token: string) => {
  const user = await User.findOne({ 'passwordReset.token': token });
  if (!user) {
    throw new Error('Invalid password reset link');
  }
  if (user.passwordReset?.expiresAt && user.passwordReset.expiresAt < new Date()) {
    throw new Error('Password reset link has expired');
  }
  if (user.passwordReset?.isUsed) {
    throw new Error('Password reset link has already been used');
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  const user = await User.findOne({
    'passwordReset.token': token,
    'passwordReset.expiresAt': { $gt: new Date() },
  });
  if (!user) {
    throw new Error('Password reset link has expired');
  }
  // Add password validation
  const validation = validatePassword(newPassword);
  if (!validation.isValid) {
    throw new Error(validation.message);
  }
  // Check if the new password is the same as the current one
  if (user.password) {
    const isSamePassword = await user.matchPassword(newPassword);
    if (isSamePassword) {
      throw new Error('New password must be different from your current password');
    }
  }

  // Set the new password and clear the reset token
  user.$set('password', newPassword);
  user.passwordReset = undefined;
  //ivalidate user sessions
  await user.save({ validateBeforeSave: false });

  //log the password reset event for security audit
  //  await logSecurityEvent({
  //    userId: user.id,
  //    event: 'password_reset',
  //    metadata: {
  //      method: 'reset_token',
  //      timestamp: new Date(),
  //    },
  //  });
  await invalidateUserSessions(user.id);
};
export const invalidatePasswordResetToken = async (token: string) => {
  const user = await User.findOne({ 'passwordReset.token': token });

  if (user && user.passwordReset) {
    user.passwordReset.isUsed = true;
    await user.save();
  }
};
