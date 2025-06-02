import RegistrationLink from '@models/RegistrationLink.model.js';
import { IUser } from '@/types/user.types.js';
import { IRegistrationLink, ILinkValidationResult } from '@/types/registration.link.types.js';
import { LinkStatus } from '@shared/constants/registration.link.js';
import { generateTokens, parseToken } from '@/utils/index.js';
import { constructRegistrationLink } from '@/utils/index.js';
import { Types } from 'mongoose';

export const generateRegistrationLink = async (
  creator: IUser
): Promise<{ url: string; expiresAt: Date }> => {
  const gymId = creator.gym.toString();
  const { publicToken, token } = generateTokens(gymId);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Links expire in 7 days

  await RegistrationLink.create({
    token: token,
    expiresAt,
    createdBy: creator._id,
    gym: creator.gym,
  });
  const registrationAccessLink = constructRegistrationLink(publicToken);
  return { url: registrationAccessLink, expiresAt };
};
//For checking before generating a new link
export const getActiveRegistrationLinks = async (gymId: string): Promise<IRegistrationLink[]> => {
  return RegistrationLink.find({
    gym: gymId,
    status: LinkStatus.ACTIVE,
  });
};
//find and update expired active link for specific gym
export const expireActiveLink = async (gymId: string): Promise<void> => {
  const now = new Date();
  await RegistrationLink.findOneAndUpdate(
    { gym: gymId, status: LinkStatus.ACTIVE, expiresAt: { $lt: now } },
    { status: LinkStatus.EXPIRED },
    { new: true }
  );
};
export const getRegistrationLinks = async (gymId: string): Promise<IRegistrationLink[]> => {
  await expireActiveLink(gymId);
  const links = await RegistrationLink.find({ gym: gymId })
    .populate('createdBy', 'firstName lastName email')
    .populate('revokedBy', 'firstName lastName email')
    .sort({ createdAt: -1 });
  return links;
};

export const validateLink = async (publicToken: string): Promise<ILinkValidationResult> => {
  try {
    const { id: gymId, token } = parseToken(publicToken);
    await expireActiveLink(gymId);

    const link = await RegistrationLink.findOne({
      gym: gymId,
      status: LinkStatus.ACTIVE,
      expiresAt: { $gt: new Date() },
    }).populate('gym', 'name address');
    if (!link) {
      const invalidLink = await RegistrationLink.findOne({ token });
      if (!invalidLink) {
        return { link: null, error: 'Link not found' };
      }
      if (invalidLink.gym._id.toString() !== gymId) {
        return { link: null, error: 'Invalid gym for this link' };
      }
      if (invalidLink.status === LinkStatus.EXPIRED) {
        return { link: null, error: 'Link has expired' };
      }
      if (invalidLink.status === LinkStatus.REVOKED) {
        return { link: null, error: 'Link has been revoked' };
      }
      return { link: null, error: 'Link is invalid' };
    }
    if (link.maxUses && link.usageCount >= link.maxUses) {
      await updateRegistrationLinkToExhaust(link.id);
      return { link: null, error: 'Link has reached the maximum number of uses' };
    }
    link.usageCount += 1;
    await link.save();
    return { link };
  } catch (error) {
    console.error('Error validating registration link:', error);
    return { link: null, error: 'Error validating link' };
  }
};

export const updateRegistrationLinkToExhaust = async (
  linkId: string
): Promise<IRegistrationLink> => {
  const link = await RegistrationLink.findByIdAndUpdate(
    linkId,
    { status: LinkStatus.EXHAUSTED },
    { new: true }
  );
  if (!link) {
    throw new Error('Registration link not found');
  }
  return link;
};
export const updateRegistrationLinkToRevoke = async (
  linkId: string,
  userId: string
): Promise<{ link: IRegistrationLink | null; error?: string }> => {
  const link = await RegistrationLink.findById(linkId);

  if (!link) {
    return { link: null, error: 'Registration link not found' };
  }

  if (link.status === LinkStatus.EXHAUSTED) {
    return { link: null, error: 'Cannot revoke an exhausted registration link' };
  }

  link.status = LinkStatus.REVOKED;
  link.revokedBy = new Types.ObjectId(userId);
  link.revokedAt = new Date();
  const updatedLink = await link.save();

  return { link: updatedLink };
};

export const updateRegistrationLinkToExpire = async (
  linkId: string
): Promise<IRegistrationLink> => {
  const link = await RegistrationLink.findByIdAndUpdate(
    linkId,
    { status: LinkStatus.EXPIRED },
    { new: true }
  );

  if (!link) {
    throw new Error('Registration link not found');
  }

  return link;
};
