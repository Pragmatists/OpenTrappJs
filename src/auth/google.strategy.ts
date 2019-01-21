import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptionWithRequest } from 'passport-google-oauth20';
import { ConfigService, JWTConfig } from '../shared/config.service';
import { GoogleProfile, JWTPayload } from './auth.model';
import { sign } from 'jsonwebtoken';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private config: JWTConfig;

  constructor(configService: ConfigService) {
    const {clientID, clientSecret, callbackURL} = configService.googleOAuthConfig;
    super({
      clientID,
      clientSecret,
      callbackURL,
      passReqToCallback: true,
      scope: ['email', 'openid', 'profile']
    } as StrategyOptionWithRequest);
    this.config = configService.jwtConfig;
  }

  async validate(request: any, accessToken: string, refreshToken: string, profile: GoogleProfile, done: (error, user) => void) {
    try {
      const payload: JWTPayload = {
        name: profile.emails[0].value,
        displayName: profile.displayName,
        roles: ['USER'],
        accountType: 'user',
        provider: 'google',
        thirdPartyId: profile.id
      };
      const jwt = this.generateToken(payload);

      const user = {...payload, jwt};

      // first argument here is ann error, second one is authenticated user
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  }

  private generateToken(payload: JWTPayload): string {
    return sign(payload, this.config.secret, {expiresIn: this.config.expiresIn});
  }

}
