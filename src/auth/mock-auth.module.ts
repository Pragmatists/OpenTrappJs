import { Module, UnauthorizedException } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { DecodedJWTPayload } from './auth.model';

@Injectable()
export class MockHttpStrategy extends PassportStrategy(BearerStrategy) {

  validate(token: string) {
    if (token === 'test-token') {
      return {email: 'user@example.com', roles: ['ROLE_ADMIN']};
    }
    throw new UnauthorizedException();
  }
}

@Injectable()
export class MockJWTStrategy extends PassportStrategy(JWTStrategy, 'jwt') {
  constructor() {
    const secret = 'test-secret';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret
    });
  }

  validate(payload: DecodedJWTPayload, done: (error, success) => void) {
    done(null, payload);
  }
}

@Module({
  imports: [
    PassportModule.register({defaultStrategy: 'bearer'})
  ],
  providers: [MockHttpStrategy, MockJWTStrategy],
  exports: [PassportModule]
})
export class MockAuthModule {
}
