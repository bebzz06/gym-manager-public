import { Request, Response } from 'express';
import { IUser } from '@/types/user.types.js';
import { IUserPopulated, IGymPopulated } from '@/types/registration.link.types.js';
import {
  generateRegistrationLink,
  getActiveRegistrationLinks,
  getRegistrationLinks,
  updateRegistrationLinkToExpire,
  updateRegistrationLinkToRevoke,
  validateLink,
} from '@/services/v1/registration/registration.link.service.js';
import Gym from '@/models/Gym.model.js';
import { formatToGymTimezone } from '@/utils/index.js';
import config from '@/config/index.js';

export const createRegistrationLink = async (req: Request, res: Response) => {
  try {
    const activeLinks = await getActiveRegistrationLinks((req.user as IUser).gym.toString());

    if (activeLinks.length > 0) {
      return res.status(400).json({
        message: 'Cannot generate a new registration link while there are active links.',
      });
    }
    const link = await generateRegistrationLink(req.user as IUser);
    const maxAge = link.expiresAt.getTime() - Date.now();
    res.cookie('registrationUrl', link.url, {
      httpOnly: false,
      secure: config.isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge,
      domain: config.cookies.domain,
    });

    res.status(201).json({
      message: 'Registration link generated successfully',
      url: link.url,
    });
  } catch (error) {
    console.error('Registration link creation error:', error);
    res.status(500).json({
      message: 'Error generating registration link',
    });
  }
};

export const getMemberRegistrationLinks = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const gym = await Gym.findById(user.gym).select('address.timezone');
    const timezone = gym?.address?.timezone || 'UTC';

    const links = await getRegistrationLinks(user.gym.toString());

    res.status(200).json({
      links: links.map(link => ({
        id: link._id,
        expiresAt: formatToGymTimezone(link.expiresAt, timezone),
        usageCount: link.usageCount,
        maxUses: link.maxUses,
        createdBy: {
          id: link.createdBy._id,
          firstName: (link.createdBy as IUserPopulated).firstName,
          lastName: (link.createdBy as IUserPopulated).lastName,
          email: (link.createdBy as IUserPopulated).email,
        },
        revokedBy: link.revokedBy
          ? {
              id: link.revokedBy._id,
              firstName: (link.revokedBy as IUserPopulated).firstName,
              lastName: (link.revokedBy as IUserPopulated).lastName,
              email: (link.revokedBy as IUserPopulated).email,
            }
          : null,
        createdAt: formatToGymTimezone(link.createdAt, timezone),
        revokedAt: link.revokedAt ? formatToGymTimezone(link.revokedAt, timezone) : null,
        status: link.status,
      })),
    });
  } catch (error) {
    console.error('Error fetching registration links:', error);
    res.status(500).json({
      message: 'Error fetching registration links',
    });
  }
};

export const validateRegistrationLink = async (req: Request, res: Response) => {
  const token = req.params.token;
  try {
    const validationResult = await validateLink(token);
    if (validationResult.error) {
      return res.status(400).json({
        success: false,
        message: validationResult.error,
      });
    }

    if (!validationResult.link) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired registration link',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Registration link validated successfully',
      gymName: (validationResult.link.gym as IGymPopulated).name,
      gymAddress: (validationResult.link.gym as IGymPopulated).address,
    });
  } catch (error) {
    console.error('Error in validateRegistrationLink:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating registration link',
    });
  }
};

export const expireRegistrationLink = async (req: Request, res: Response) => {
  try {
    const linkId = req.params.id;
    const expiredLink = await updateRegistrationLinkToExpire(linkId);
    res.status(200).json({
      message: 'Registration link expired successfully',
      link: expiredLink,
    });
  } catch (error) {
    console.error('Error expiring registration link:', error);
    res.status(500).json({
      message: 'Error expiring registration link',
    });
  }
};

export const revokeRegistrationLink = async (req: Request, res: Response) => {
  try {
    const linkId = req.params.id;
    const userId = (req.user as IUser).id;

    const result = await updateRegistrationLinkToRevoke(linkId, userId);
    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.clearCookie('registrationUrl');
    res.status(200).json({
      success: true,
      message: 'Registration link revoked successfully',
      link: result.link,
    });
  } catch (error) {
    console.error('Error revoking registration link:', error);
    res.status(500).json({
      success: false,
      message: 'Error revoking registration link',
    });
  }
};
