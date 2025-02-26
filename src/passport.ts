import passport from 'passport';
import express from 'express';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

export const initializePassport = (app: express.Application) => {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret'
  };

  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    return done(null, jwt_payload);
  }));

  app.use(passport.initialize());
};
