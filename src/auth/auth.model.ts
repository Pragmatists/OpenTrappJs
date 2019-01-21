export class AuthStatus {
  readonly loginUrl = '/api/v1/authentication/login';
  readonly logoutUrl = '/api/v1/authentication/logout';

  constructor(readonly name: string,
              readonly id: string,
              readonly roles: string[],
              readonly accountType: string,
              readonly expiration: Date) {
  }
}

export interface JWTPayload {
  name: string;
  id: string;
  roles: string[];
  accountType: 'user' | 'service';
  thirdPartyId?: string;
  provider: string;
}

export interface DecodedJWTPayload extends JWTPayload {
  iat: number;
  exp: number;
}

export interface RequestWithUser {
  user: DecodedJWTPayload;
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
