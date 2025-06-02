export const encode = (string: string) => Buffer.from(string).toString('base64');
export const decode = (string: string) => Buffer.from(string, 'base64').toString();
