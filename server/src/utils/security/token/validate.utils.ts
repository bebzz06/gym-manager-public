import { decode } from '../encoding/base64.utils.js';

export const parseToken = (publicToken: string): { id: string; token: string } => {
  // First 24 chars are the privateToken (17 chars encoded in base64)
  const token = decode(publicToken.slice(0, 24));
  const id = decode(publicToken.slice(24));
  return {
    id,
    token,
  };
};
