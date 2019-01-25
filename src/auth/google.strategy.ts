import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    const email = profile.emails[0].value;
    if (!email.match(/.+@pragmatists\.(com|pl)$/g)) {
      throw new UnauthorizedException('Provided email must be in pragmatists domain');
    }
    const payload = JWTPayload.userJWTPayload(
      profile.displayName,
      email,
      ['USER'],
      'google',
      profile.id
    );
    try {
      const jwt = this.generateToken(payload);
      const user = {...payload, jwt};
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  }

  private generateToken(payload: JWTPayload): string {
    return sign(payload.asPayload(), this.config.secret, {expiresIn: this.config.expiresIn});
  }

}
