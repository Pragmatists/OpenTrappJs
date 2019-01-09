import {Module, UnauthorizedException} from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MockHttpStrategy extends PassportStrategy(Strategy) {

  validate(token: string) {
    if (token === 'test-token') {
      return {email: 'user@example.com', roles: ['ROLE_ADMIN']};
    }
    throw new UnauthorizedException();
  }
}

@Module({
  imports: [
    PassportModule.register({defaultStrategy: 'bearer'})
  ],
  providers: [MockHttpStrategy],
  exports: [PassportModule]
})
export class MockServiceAuthModule {
}
