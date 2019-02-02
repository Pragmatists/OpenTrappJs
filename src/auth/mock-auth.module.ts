import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserDetails } from './auth.model';
import { Observable, of, throwError } from 'rxjs';
import { TokenPayload } from 'google-auth-library/build/src/auth/loginticket';

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

export class MockGoogleClient {

  verifyToken(token: string): Observable<TokenPayload> {
    if (token !== 'valid.google.token') {
      return throwError('Invalid token');
    }
    return of({
      email: 'john.doe@pragmatists.pl',
      picture: 'http://user-profile.pl/johndoe/picture',
      name: 'John Doe'
    } as any);
  }

}

@Module({
  imports: [
    PassportModule.register({defaultStrategy: 'jwt'})
  ],
  providers: [MockJWTStrategy],
  exports: [PassportModule]
})
export class MockAuthModule {
}
