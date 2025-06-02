import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptionsWithRequest } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '@models/User.model.js';
import { isSessionValid } from '@/services/v1/auth/session.service.js';
import { SESSION_MESSAGES } from '@shared/constants/messages.js';
import config from '@/config/index.js';

const tokenExtractor = (req: any) => {
  let token = null;

  const authHeader = ExtractJwt.fromAuthHeaderAsBearerToken();
  token = authHeader(req);

  // If no Authorization header, try cookies
  if (!token && req && req.cookies) {
    token = req.cookies['accessToken'];
  }

  return token;
};

const options: StrategyOptionsWithRequest = {
  jwtFromRequest: tokenExtractor,
  secretOrKey: config.jwt.secret,
  passReqToCallback: true as const,
};

const initializePassport = (): passport.PassportStatic => {
  // Local Strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { message: 'User not found' });
          }

          const isMatch = await user.matchPassword(password);
          if (!isMatch) {
            return done(null, false, { message: 'Invalid password' });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // JWT Strategy
  passport.use(
    new JwtStrategy(options, async (req, jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.id);
        if (!user) return done(null, false);

        const isValid = await isSessionValid(jwt_payload.id, jwt_payload.version);
        if (!isValid) {
          return done(null, false, {
            message: SESSION_MESSAGES.ERRORS.INVALID,
            invalidated: true,
          });
        }

        req.tokenSource = req.cookies['accessToken'] ? 'cookie' : 'bearer';
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    })
  );

  return passport;
};

export default initializePassport;
