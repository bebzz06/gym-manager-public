import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import User from '@/models/User.model.js';
import { IUser } from '@/types/user.types.js';

declare global {
  namespace Express {
    interface Request {
      loginUser?: IUser;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (!user && info?.invalidated) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(401).json({
        message: info?.message || 'Unauthorized',
        shouldLogout: true,
      });
    }
    if (!user) {
      return res.status(401).json({
        message: info?.message || 'Unauthorized',
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

//use for routes that need to be protected for instance only owners and admins can access.
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    if (!roles.includes((req.user as IUser).role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden',
      });
    }

    next();
  };
};
export const validateLoginAttempt = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    // Check if user has a password set
    if (!user.password) {
      return res.status(401).json({
        message: 'Account requires password setup. Please contact your administrator.',
      });
    }

    // Attach user to request for next middleware
    req.loginUser = user;
    next();
  } catch (error) {
    console.error('Login validation error:', error);
    res.status(500).json({
      message: 'Error during login attempt',
    });
  }
};
