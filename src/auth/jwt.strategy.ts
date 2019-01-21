import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '../shared/config.service';
import { DecodedJWTPayload } from './auth.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {

  constructor(configService: ConfigService) {
    const {secret} = configService.jwtConfig;
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret
    });
  }

  validate(payload: DecodedJWTPayload) {
    return payload;
  }

}
