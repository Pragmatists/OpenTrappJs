import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService, JWTConfig } from '../shared/config.service';
import { JWTPayload, ServiceAccountTokenRequestDTO, ServiceAccountTokenResponseDTO } from './auth.model';
import { sign } from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { ServiceAccountService } from '../accounts/service-account.service';
import { map, throwIfEmpty } from 'rxjs/operators';

export interface AuthorizedUser {
  email: string;
  roles: string[];
}

@Injectable()
export class AuthService {
  private config: JWTConfig;

  constructor(private readonly serviceAccountService: ServiceAccountService,
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

  private generateToken(payload: JWTPayload): string {
    return sign(payload.asPayload(), this.config.secret, {expiresIn: this.config.expiresIn});
  }
}
