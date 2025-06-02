import { PASSWORD_MESSAGES } from '../constants/messages.js';

export const getPasswordRequirements = (): string[] => {
  return PASSWORD_MESSAGES.REQUIREMENTS.RULES;
};
