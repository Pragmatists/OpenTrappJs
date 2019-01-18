import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptionWithRequest } from 'passport-google-oauth20';
import { ConfigService } from '../shared/config.service';
import { GoogleProfile } from './auth.model';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {

  constructor(configService: ConfigService) {
    const googleConfig = configService.googleOAuthConfig;
    console.log('constructor', googleConfig);
    super({
      clientID    : googleConfig.clientID,
      clientSecret: googleConfig.clientSecret,
      callbackURL : googleConfig.callbackURL,
      passReqToCallback: true,
      scope: ['email', 'openid', 'profile']
    } as StrategyOptionWithRequest);
  }

  async validate(request: any, accessToken: string, refreshToken: string, profile: GoogleProfile, done: (error, user) => void) {
    try {
      console.log('acc token', accessToken);
      console.log('ref token', refreshToken);
      //console.log('profile', profile);

      const user = {
          accessToken,
          refreshToken,
          email: profile.emails[0].value,
          displayName: profile.displayName,
          domain: profile._json.domain
        };

      // first argument here is ann error, second one is authenticated user
      done(null, user);
    } catch (err) {
      console.error(err);
      done(err, false);
    }
  }

}
