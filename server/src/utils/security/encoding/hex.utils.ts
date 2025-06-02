export const stringToHex = (str: string): string => {
  return Buffer.from(str).toString('hex').toUpperCase();
};

export const hexToString = (hex: string): string => {
  return Buffer.from(hex, 'hex').toString('utf-8');
};
