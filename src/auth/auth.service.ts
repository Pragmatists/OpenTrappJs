import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService, JWTConfig } from '../shared/config.service';
import { JWTPayload, ServiceAccountTokenRequestDTO, ServiceAccountTokenResponseDTO, UserTokenResponseDTO } from './auth.model';
import { sign } from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { ServiceAccountService } from '../accounts/service-account.service';
import { catchError, defaultIfEmpty, filter, flatMap, map, throwIfEmpty } from 'rxjs/operators';
import { TokenPayload } from 'google-auth-library/build/src/auth/loginticket';
import { pragmaEmailToUsername } from '../utils/email-utils';
import { GoogleClient } from './google-client';
import { AuthorizedUserService } from '../accounts/authorized-user.service';
import { isNil, uniq } from 'lodash';

export interface AuthorizedUser {
  email: string;
  roles: string[];
}

@Injectable()
export class AuthService {
  private readonly config: JWTConfig;

  constructor(private readonly serviceAccountService: ServiceAccountService,
              private readonly authorizedUserService: AuthorizedUserService,
              private readonly googleClient: GoogleClient,
              configService: ConfigService) {
    this.config = configService.jwtConfig;
  }

  tokenForServiceAccount(tokenRequestBody: ServiceAccountTokenRequestDTO): Observable<ServiceAccountTokenResponseDTO> {
    return this.serviceAccountService.findByClientIDAndSecret(tokenRequestBody.clientID, tokenRequestBody.secret).pipe(
      throwIfEmpty(() => new UnauthorizedException('Invalid credentials')),
      map(serviceAccount => JWTPayload.serviceJWTPayload(serviceAccount.name, serviceAccount.clientID, ['EXTERNAL_SERVICE'])),
      map(payload => this.generateToken(payload)),
      map(jwt => ({token: jwt}))
    );
  }

  tokenForUser(token: string): Observable<UserTokenResponseDTO> {
    return this.googleClient.verifyToken(token).pipe(
      flatMap(payload => this.googlePayloadToTokenResponse(payload)),
      catchError(err => {
        throw new UnauthorizedException(err);
      })
    );
  }

  private generateToken(payload: JWTPayload): string {
    return sign(payload.asPayload(), this.config.secret, {expiresIn: this.config.expiresIn});
  }

  private googlePayloadToTokenResponse(payload: TokenPayload): Observable<UserTokenResponseDTO> {
    const email = payload.email;
    const name = pragmaEmailToUsername(email);
    return this.nameToUserRoles(name).pipe(
      map(roles => ({
        token: this.generateToken(JWTPayload.userJWTPayload(payload.name, email, roles)),
        displayName: payload.name,
        name,
        email,
        profilePicture: payload.picture,
        roles
      }))
    );
  }

  private nameToUserRoles(name: string): Observable<string[]> {
    return this.authorizedUserService.findByName(name).pipe(
      filter(user => !isNil(user)),
      defaultIfEmpty({roles: []}),
      map(user => uniq(['USER', ...user.roles]))
    );
  }
}
