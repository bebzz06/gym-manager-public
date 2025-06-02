import { NextFunction, Request, Response } from 'express';
import Gym from '@models/Gym.model.js';
import User from '@models/User.model.js';
import { UserRole } from '@shared/constants/user.js';
import { SubscriptionStatus } from '@shared/constants/subscription.js';
import mongoose from 'mongoose';
import { validatePassword } from '@/services/v1/auth/password.service.js';
import { generateTokens, logger } from '@/utils/index.js';
import { constructEmailVerificationLink } from '@/utils/index.js';
import { sendVerificationEmail } from '@/services/v1/email/email.service.js';
import { uploadGymLogo, deleteGymLogo } from '@/services/v1/storage/firebase.service.js';
import { IUser } from '@/types/user.types.js';
import { MULTI_TIMEZONE_COUNTRIES } from '@shared/constants/countries.js';
import { initializeSubscriptionJobs } from '@/jobs/subscription.jobs.js';

export const createGym = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      // Gym details
      gymName,
      city,
      region,
      country,
      // Owner details
      firstName,
      lastName,
      email,
      password,
    } = req.body;

    // Validate required fields
    if (!gymName || !country || !firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: 'Please provide all required fields',
      });
    }
    if (MULTI_TIMEZONE_COUNTRIES.includes(country)) {
      return res.status(400).json({
        message: 'Country not supported',
      });
    }

    // Check if admin email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: 'email already registered',
      });
    }
    // Check if gym name already exists
    const gymExists = await Gym.findOne({ name: gymName });
    if (gymExists) {
      return res.status(400).json({
        message: 'Gym name already registered',
      });
    }
    //password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: passwordValidation.message,
      });
    }

    // Generate email verification token
    const { publicToken: emailVerificationToken } = generateTokens(email);

    // Create gym
    const [newGym] = await Gym.create(
      [
        {
          name: gymName,
          address: {
            country,
            ...(city && { city }),
            ...(region && { region }),
          },
          subscriptionStatus: SubscriptionStatus.TRIAL,
        },
      ],
      { session }
    );
    // Create owner user with email verification
    const [newUser] = await User.create(
      [
        {
          gym: newGym._id,
          firstName,
          lastName,
          email,
          password,
          role: UserRole.OWNER,
          emailVerification: {
            token: emailVerificationToken,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            isUsed: false,
          },
        },
      ],
      { session }
    );

    // Generate and send verification email
    const verificationLink = constructEmailVerificationLink(emailVerificationToken);

    await sendVerificationEmail(email, verificationLink, gymName);

    await session.commitTransaction();
    session.endSession();

    // Reinitialize all subscription jobs to ensure all gyms are included
    await initializeSubscriptionJobs();

    res.status(201).json({
      message: 'Gym created successfully. Check your inbox for verification link.',
      gym: {
        id: newGym._id,
        name: newGym.name,
      },
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error('Gym registration error:', error);
    next(error);
  }
};

export const uploadGymLogoImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gymId = (req.user as IUser).gym.toString();

    // Check if user has permission (owner or admin)
    const user = await User.findOne({
      _id: (req.user as IUser).id,
      isDeleted: false,
    });

    if (!user || (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN)) {
      return res
        .status(403)
        .json({ message: 'Unauthorized: Only owners and admins can update gym logo' });
    }

    // Check if gym exists
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // If no file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // If gym already has a logo, delete it
    if (gym.logo) {
      await deleteGymLogo(gym.logo);
    }

    // Upload the new logo
    const logoImage = await uploadGymLogo(gymId, req.file);

    // Update gym with new logo URL and path
    gym.logo = logoImage;
    await gym.save();

    res.status(200).json({
      message: 'Gym logo updated successfully',
      logo: logoImage,
    });
  } catch (error) {
    logger.error('Upload gym logo error:', error);
    next(error);
  }
};

export const deleteGymLogoImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gymId = (req.user as IUser).gym.toString();

    // Check if user has permission (owner or admin)
    const user = await User.findOne({
      _id: (req.user as IUser).id,
      isDeleted: false,
    });

    if (!user || (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN)) {
      return res
        .status(403)
        .json({ message: 'Unauthorized: Only owners and admins can delete gym logo' });
    }

    // Check if gym exists
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // If gym has a logo, delete it
    if (gym.logo) {
      await deleteGymLogo(gym.logo);
      gym.logo = null;
      await gym.save();
    }

    res.status(200).json({
      message: 'Gym logo deleted successfully',
    });
  } catch (error) {
    logger.error('Delete gym logo error:', error);
    next(error);
  }
};

export const updateGymInfo = async (req: Request, res: Response, next: NextFunction) => {
  //todo: create some validation rules for updatable fields
  try {
    const gymId = (req.user as IUser).gym.toString();

    // Check if user has permission (owner or admin)
    const user = await User.findOne({
      _id: (req.user as IUser).id,
      isDeleted: false,
    });

    if (!user || (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN)) {
      return res
        .status(403)
        .json({ message: 'Unauthorized: Only owners and admins can update gym information' });
    }

    // Check if gym exists
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // Extract updatable fields from request body
    const { email, address, phoneNumber, website, description } = req.body;

    // Explicitly exclude name from updates to make it immutable
    const updatedAddress = address
      ? {
          ...address,
          country: gym.address.country,
          timezone: gym.address.timezone, //inmutable country and timezone
        }
      : gym.address;

    const updatedGym = await Gym.findByIdAndUpdate(
      gymId,
      {
        $set: {
          email: email || gym.email,
          address: updatedAddress,
          phoneNumber: phoneNumber || gym.phoneNumber,
          website: website || gym.website,
          description: description || gym.description,
        },
      },
      { new: true }
    );

    if (!updatedGym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    res.status(200).json({
      message: 'Gym information updated successfully',
      gym: {
        id: updatedGym._id,
        name: updatedGym.name,
      },
    });
  } catch (error) {
    logger.error('Update gym info error:', error);
    next(error);
  }
};
