import { NextFunction, Request, Response } from 'express';
import User from '@models/User.model.js';
import { IUser } from '@/types/user.types.js';
import { UserRole } from '@shared/constants/user.js';
import { uploadProfileImage, deleteProfileImage } from '@/services/v1/storage/firebase.service.js';
import { invalidateUserSessions } from '@/services/v1/auth/session.service.js';
import { formatDatesInObject, logger } from '@/utils/index.js';

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as IUser).id;

    // First check if user exists and is not deleted
    const existingUser = await User.findOne({
      _id: userId,
      isDeleted: false,
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found or has been deleted' });
    }

    const { email, phoneNumber, dateOfBirth, emergencyContact } = req.body;

    const isEmailUpdated = email && email !== existingUser.email;
    // Check if email is being changed and if it's already taken
    if (isEmailUpdated) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      // Email is changing, set email as unverified and invalidate sessions
      existingUser.isEmailVerified = false;
    }

    //check if new email is different from existing email
    // Validate emergency contact for users under 18
    const isEmergencyContactIncomplete =
      !emergencyContact?.firstName ||
      !emergencyContact?.lastName ||
      !emergencyContact?.phoneNumber ||
      !emergencyContact?.relationship;

    if (existingUser.age && existingUser.age < 18 && isEmergencyContactIncomplete) {
      return res.status(400).json({
        message:
          'Complete emergency contact information (first name, last name, phone number, and relationship) is required for members under 18',
      });
    }

    if (dateOfBirth && existingUser.dateOfBirth === undefined) {
      existingUser.dateOfBirth = dateOfBirth;
    }
    existingUser.email = email || existingUser.email;
    existingUser.phoneNumber = phoneNumber || existingUser.phoneNumber;
    existingUser.updatedBy = userId;

    if (emergencyContact) {
      existingUser.emergencyContact = {
        ...existingUser.emergencyContact,
        ...emergencyContact,
      };
    }

    await existingUser.save();

    // If email was updated, send response with logout flag
    if (isEmailUpdated) {
      await invalidateUserSessions(userId);
      return res.status(200).json({
        message: 'Profile updated successfully. Please log in again with your new email.',
        shouldLogout: true,
      });
    }

    // Normal response for non-email updates
    res.status(200).json({
      message: 'Profile updated successfully',
      shouldLogout: false,
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as IUser).id;
    const user = await User.findOne(
      { _id: userId, isDeleted: false },
      '-password -__v -isDeleted -deletedAt -deletedBy -createdAt -updatedAt -createdBy -updatedBy -tokenVersion -isEmailVerified'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the user's gym timezone
    const gym = await user.getGymInfo();
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }
    const membershipInfo = await user.getMembershipInfo();
    const paymentHistory = await user.getPaymentHistory();

    // Format dates in membership info
    const formattedMembershipInfo = formatDatesInObject(
      membershipInfo,
      gym.address.timezone || 'UTC',
      ['endDate', 'lastPayment']
    );

    // Format dates in payment history
    const formattedPaymentHistory = {
      ...paymentHistory,
      payments: paymentHistory.payments.map(payment =>
        formatDatesInObject(payment, gym.address.timezone || 'UTC', ['createdAt'])
      ),
    };

    const userResponse: any = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      profileImage: user.profileImage,
      email: user.email,
      phoneNumber: user.phoneNumber,
      emergencyContact: user.emergencyContact,
      role: user.role,
      rank: user.rank,
      membershipInfo: formattedMembershipInfo,
      paymentHistory: formattedPaymentHistory,
    };

    // Fetch basic gym info for all users
    if (gym) {
      // Basic gym info for all users
      userResponse.gym = {
        id: gym.id,
        name: gym.name,
        address: gym.address,
        phoneNumber: gym.phoneNumber,
        email: gym.email,
        logo: gym.logo,
        website: gym.website,
        description: gym.description,
      };

      // Additional gym info only for owners and admins
      if (user.role === UserRole.OWNER || user.role === UserRole.ADMIN) {
        userResponse.gym.isActive = gym.isActive;
        userResponse.gym.subscriptionStatus = gym.subscriptionStatus;
        userResponse.gym.subscriptionEndDate = gym.subscriptionEndDate; //todo: handle formatting and enddate settting once payment subscription api is available.
      }
    }

    res.status(200).json({ user: userResponse });
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
};

export const uploadProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as IUser).id;
    const gymId = (req.user as IUser).gym.toString();

    // Check if user exists
    const user = await User.findOne({
      _id: userId,
      isDeleted: false,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If no file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // If user already has a profile image, delete it
    if (user.profileImage) {
      await deleteProfileImage(user.profileImage);
    }

    // Upload the new image with gymId
    const profileImage = await uploadProfileImage(gymId, userId, req.file);

    // Update user with new profile image URL and path
    user.profileImage = profileImage;
    await user.save();

    res.status(200).json({
      message: 'Profile picture updated successfully',
      profileImage: profileImage,
    });
  } catch (error) {
    logger.error('Upload profile picture error:', error);
    next(error);
  }
};

export const deleteProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as IUser).id;

    // Check if user exists
    const user = await User.findOne({
      _id: userId,
      isDeleted: false,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user has a profile image, delete it
    if (user.profileImage) {
      await deleteProfileImage(user.profileImage);
      user.profileImage = null;
      await user.save();
    }

    res.status(200).json({
      message: 'Profile picture deleted successfully',
    });
  } catch (error) {
    logger.error('Delete profile picture error:', error);
    next(error);
  }
};
