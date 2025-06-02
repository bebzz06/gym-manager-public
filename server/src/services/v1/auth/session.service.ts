import User from '@/models/User.model.js';

export const invalidateUserSessions = async (userId: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, {
    $inc: { tokenVersion: 1 },
  });
};

export const isSessionValid = async (userId: string, tokenVersion: number): Promise<boolean> => {
  const user = await User.findById(userId);
  return user?.tokenVersion === tokenVersion;
};
