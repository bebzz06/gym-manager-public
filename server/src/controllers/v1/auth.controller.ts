import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '@models/User.model.js';
import Gym from '@models/Gym.model.js';
import { IUser } from '@/types/user.types.js';
import { UserRole } from '@shared/constants/user.js';
import {
  changePassword,
  generatePasswordResetToken,
  validatePasswordResetToken,
  resetPassword as resetPasswordService,
  validatePassword,
  invalidatePasswordResetToken,
} from '@/services/v1/auth/password.service.js';
import { validateLink } from '@/services/v1/registration/registration.link.service.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail as sendResetEmail,
  sendMemberSetupEmail as sendSetupEmail,
} from '@/services/v1/email/email.service.js';
import {
  constructEmailVerificationLink,
  constructPasswordResetLink,
  generateJwtTokens,
  generateTokens,
  ACCESS_TOKEN_EXPIRY_SEC,
  REFRESH_TOKEN_EXPIRY_SEC,
  logger,
} from '@/utils/index.js';
import {
  verifyEmailToken,
  updateEmailVerificationToken,
  completeVerificationWithPassword as completeVerification,
  invalidateEmailVerificationToken,
} from '@/services/v1/email/verification.service.js';
import config from '@/config/index.js';
import { invalidateUserSessions } from '@/services/v1/auth/session.service.js';

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, dateOfBirth, guardian, token } =
      req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !dateOfBirth) {
      return res.status(400).json({
        message: 'Please provide all required fields',
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: 'Email already registered',
      });
    }
    //password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: passwordValidation.message,
      });
    }

    // Get gym information from registration token
    const registrationLink = await validateLink(token);
    if (!registrationLink || !registrationLink.link?.gym._id) {
      return res.status(400).json({
        message: registrationLink?.error,
      });
    }
    // generate email verification token
    const { publicToken: emailVerificationToken } = generateTokens(email);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      dateOfBirth,
      role: UserRole.MEMBER,
      gym: registrationLink.link?.gym._id,
      ...(guardian && {
        guardian,
        emergencyContact: guardian, // Use guardian as emergency contact for minors
      }),
      emailVerification: {
        token: emailVerificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), //24 hours
        isUsed: false,
      },
    });
    // generate email verification link
    const verificationLink = constructEmailVerificationLink(emailVerificationToken);
    // send verification email with the link
    const gymName = (await Gym.findById(registrationLink.link?.gym._id))?.name || 'Our Gym';
    await sendVerificationEmail(email, verificationLink, gymName);
    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      user: {
        email: user.email,
      },
    });
  } catch (error) {
    logger.error('User creation error:', error);
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
      isDeleted: false,
    }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before signing in',
        needsVerification: true,
        email: user.email,
      });
    }

    const { accessToken, refreshToken } = await generateJwtTokens(user.id);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_EXPIRY_SEC * 1000,
      domain: config.cookies.domain,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_EXPIRY_SEC * 1000,
      domain: config.cookies.domain,
    });

    // Send response
    return res.status(200).json({
      user: {
        email: user.email,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Get refresh token from cookies
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    // 2. Verify the refresh token is valid and not expired
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { id: string };

    // 3. Generate only a new access token
    const { accessToken } = await generateJwtTokens(decoded.id);

    // 4. Set only the new access token cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_EXPIRY_SEC * 1000,
      domain: config.cookies.domain,
    });

    // 5. Send success response
    return res.json({ status: 200 });
  } catch (error) {
    // 6. Handle token verification errors
    if (error instanceof jwt.TokenExpiredError) {
      // Clear both cookies if refresh token is expired
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(401).json({ message: 'Refresh token expired' });
    }
    logger.error('Refresh token error:', error);
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (config.isTest) {
      if (req.user) {
        await invalidateUserSessions((req.user as IUser).id);
      }
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

export const validateSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.json({
        valid: false,
        message: 'No refresh token found',
      });
    }

    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { id: string };
    return res.json({
      valid: true,
      userId: decoded.id,
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.clearCookie('refreshToken');
      return res.json({
        valid: false,
        message: 'Invalid refresh token',
      });
    }

    logger.error('Session validation error:', error);
    next(error);
  }
};

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as IUser).id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Please provide both current and new password',
      });
    }

    await changePassword(userId, currentPassword, newPassword);

    res.status(200).json({
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    logger.error('Password change error:', error);
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: 'Please provide both token and new password',
      });
    }

    await resetPasswordService(token, newPassword);

    res.status(200).json({
      message: 'Password reset successfully',
    });
  } catch (error: any) {
    logger.error('Password reset error:', error);
    next(error);
  }
};

export const resendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  try {
    // Find the user first
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the gym name
    const gymName = (await Gym.findById(user.gym))?.name || 'Our Gym';

    const { publicToken: emailVerificationToken } = generateTokens(email);
    await updateEmailVerificationToken(email, emailVerificationToken);
    const verificationLink = constructEmailVerificationLink(emailVerificationToken);

    await sendVerificationEmail(email, verificationLink, gymName);
    res.status(200).json({ message: 'Verification email sent successfully' });
  } catch (error) {
    logger.error('Error resending verification email:', error);
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;

  try {
    const verificationResult = await verifyEmailToken(token);
    await invalidateEmailVerificationToken(token);

    if (verificationResult.needsPasswordSetup) {
      // If password setup is needed, return this info to the frontend
      return res.status(200).json({
        message: 'Email verification pending password setup',
        needsPasswordSetup: true,
        token: verificationResult.token,
        email: verificationResult.email,
      });
    }

    // Normal verification success
    return res.status(200).json({
      message: 'Email verified successfully',
      email: verificationResult.email,
    });
  } catch (error: any) {
    logger.error('Email verification error:', error);
    next(error);
  }
};

export const completeVerificationWithPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      message: 'Token and password are required',
    });
  }

  try {
    const result = await completeVerification(token, password);

    return res.status(200).json({
      message: 'Account setup completed successfully',
      email: result.email,
    });
  } catch (error: any) {
    logger.error('Complete verification error:', error);
    next(error);
  }
};

export const sendPasswordResetEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    // Find the user
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({
        message: 'If your email is registered, you will receive a password reset link',
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before resetting your password',
        needsVerification: true,
        email: user.email,
      });
    }

    // Generate token and send reset email
    const { token } = await generatePasswordResetToken(email);
    const resetLink = constructPasswordResetLink(token);
    await sendResetEmail(email, resetLink);

    res.status(200).json({
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    logger.error('Send password reset email error:', error);
    next(error);
  }
};

export const verifyPasswordResetToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    await validatePasswordResetToken(token);
    await invalidatePasswordResetToken(token);
    res.status(200).json({ message: 'Password reset token verified successfully' });
  } catch (error: any) {
    logger.error('Password reset token verification error:', error);
    next(error);
  }
};

export const sendMemberSetupEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  try {
    // Find the member
    const member = await User.findOne({ email });
    const gymName = (await Gym.findById(member?.gym))?.name || 'Our Gym';
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Check if member is already verified
    if (member.isEmailVerified) {
      return res.status(400).json({ message: 'Member is already verified' });
    }

    // Generate setup token
    const { publicToken: setupToken } = generateTokens(email);

    // Update member with new token
    await updateEmailVerificationToken(email, setupToken);

    // Generate setup link
    const setupLink = constructEmailVerificationLink(setupToken);

    // Send email
    await sendSetupEmail(email, setupLink, member.firstName, gymName);

    res.status(200).json({
      message: 'Setup email sent successfully',
      email,
    });
  } catch (error) {
    logger.error('Send member setup email error:', error);
    next(error);
  }
};
