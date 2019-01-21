export class AuthStatus {
  readonly loginUrl = '/api/v1/authentication/login';
  readonly name: string;

  constructor(readonly displayName: string,
              readonly email: string,
              readonly roles: string[],
              readonly accountType: string,
              readonly expiration: Date) {
    this.name = email.replace(/(@pragmatists\.pl|@pragmatists\.com)$/g, '');
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
