import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import { encode } from '../encoding/base64.utils.js';
import User from '@/models/User.model.js';
import config from '@/config/index.js';

export const ACCESS_TOKEN_EXPIRY_SEC = config.jwt.accessTokenExpirationTimeInMinutes * 60;

export const REFRESH_TOKEN_EXPIRY_SEC = config.jwt.refreshTokenExpirationTimeInDays * 24 * 60 * 60;

export const generateJwtTokens = async (
  userId: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const user = await User.findById(userId);
  const payload = {
    id: userId,
    version: user?.tokenVersion,
  };
  const accessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: ACCESS_TOKEN_EXPIRY_SEC });
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: REFRESH_TOKEN_EXPIRY_SEC,
  });
  return { accessToken, refreshToken };
};

//link tokens
export const generateTokens = (id: string): { publicToken: string; token: string } => {
  const token = nanoid(17);
  const privateToken = encode(token);
  const secret = encode(id.toString());
  const publicToken = `${privateToken}${secret}`;
  return { publicToken, token };
};
