import { pragmaEmailToUsername } from '../utils/email-utils';
import { IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class AuthStatus {

  constructor(readonly displayName: string,
              readonly name: string,
              readonly email: string,
              readonly roles: string[],
              readonly accountType: string,
              readonly expiration: Date) {
  }
}

export class JWTPayload {

  private constructor(readonly displayName: string,
                      readonly name: string,
                      readonly roles: string[],
                      readonly accountType: 'user' | 'service',
                      readonly provider: string,
                      readonly email?: string,
                      readonly thirdPartyId?: string) {
  }

  static userJWTPayload(displayName: string,
                        email: string,
                        roles: string[],
                        provider = 'google',
                        thirdPartyId?: string) {
    if (!email.match(/.+@pragmatists\.(com|pl)$/g)) {
      throw new Error('Provided email must be in pragmatists domain');
    }
    return new JWTPayload(displayName, pragmaEmailToUsername(email), roles, 'user', provider, email, thirdPartyId);
  }

  static serviceJWTPayload(name: string, clientID: string, roles: string[], provider = 'opentrapp') {
    return new JWTPayload(name, clientID, roles, 'service', provider);
  }

  asPayload() {
    return {
      displayName: this.displayName,
      name: this.name,
      email: this.email,
      roles: this.roles,
      accountType: this.accountType,
      provider: this.provider,
      thirdPartyId: this.thirdPartyId
    };
  }
}

export interface UserDetails {
  readonly displayName: string;
  readonly name: string;
  readonly email: string;
  readonly roles: string[];
  readonly accountType: 'user' | 'service';
  readonly provider: string;
  readonly thirdPartyId?: string;
  readonly iat: number;
  readonly exp: number;
}

export interface RequestWithUser {
  user: UserDetails;
}

export interface GoogleProfile {
  id: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  emails: {value: string; type: string}[];
  provider: string;
  _json: {
    domain: string;
    objectType: string;
    language: string;
  };
}

export class ServiceAccountTokenRequestDTO {
  @IsNotEmpty()
  @ApiModelProperty({example: 'some-client-id'})
  clientID: string;
  @IsNotEmpty()
  @ApiModelProperty({example: 'some-client-secret'})
  secret: string;
}

export interface ServiceAccountTokenResponseDTO {
  token: string;
}

export interface UserTokenResponseDTO {
  token: string;
  name: string;
  displayName: string;
  email: string;
  profilePicture: string;
  roles: string[];
}
