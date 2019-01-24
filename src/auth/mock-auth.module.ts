import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserDetails } from './auth.model';

@Injectable()
export class MockJWTStrategy extends PassportStrategy(JWTStrategy, 'jwt') {
  constructor() {
    const secret = 'test-secret';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret
    });
  }

  validate(payload: UserDetails, done: (error, success) => void) {
    done(null, payload);
  }
}

@Module({
  imports: [
    PassportModule.register({defaultStrategy: 'bearer'})
  ],
  providers: [MockJWTStrategy],
  exports: [PassportModule]
})
export class MockAuthModule {
}
