import User from '@models/User.model.js';
import { parseToken } from '@/utils/index.js';

interface IVerificationResult {
  success: boolean;
  email: string;
  needsPasswordSetup: boolean;
  token?: string; // We'll keep the token if password setup is needed
}

export const verifyEmailToken = async (token: string): Promise<IVerificationResult> => {
  try {
    // Parse the token to get the email
    const { id: email } = parseToken(token);

    // Find user with matching email, token, and verification status
    const user = await User.findOne({
      email,
      'emailVerification.token': token,
      'emailVerification.expiresAt': { $gt: new Date() },
      isEmailVerified: false,
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }
    if (user.emailVerification?.isUsed) {
      throw new Error('Verification link has already been used, please request a new link');
    }

    // Check if user needs password setup
    const needsPasswordSetup = !user.password;

    if (!needsPasswordSetup) {
      // Complete verification immediately if no password setup needed
      user.isEmailVerified = true;
      user.emailVerification = undefined; // Clear verification data
      await user.save();

      return {
        success: true,
        email: user.email,
        needsPasswordSetup: false,
      };
    }

    // If password setup is needed, return without completing verification
    return {
      success: true,
      email: user.email,
      needsPasswordSetup: true,
      token, // Return token for password setup step
    };
  } catch (error) {
    console.error('Email verification error:', error);
    throw error;
  }
};

export const invalidateEmailVerificationToken = async (token: string) => {
  const user = await User.findOne({ 'emailVerification.token': token });
  if (user && user.emailVerification) {
    user.emailVerification.isUsed = true;
    await user.save();
  }
};
export const updateEmailVerificationToken = async (email: string, token: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }
  user.emailVerification = {
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    isUsed: false,
  };
  await user.save();
  return {
    success: true,
    email: user.email,
  };
};

// New function to complete verification with password setup
export const completeVerificationWithPassword = async (
  token: string,
  password: string
): Promise<IVerificationResult> => {
  try {
    const { id: email } = parseToken(token);

    const user = await User.findOne({
      email,
      'emailVerification.token': token,
      'emailVerification.expiresAt': { $gt: new Date() },
      isEmailVerified: false,
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    // Set password and complete verification
    user.password = password;
    user.isEmailVerified = true;
    user.emailVerification = undefined;
    await user.save();

    return {
      success: true,
      email: user.email,
      needsPasswordSetup: false,
    };
  } catch (error) {
    console.error('Password setup error:', error);
    throw error;
  }
};
