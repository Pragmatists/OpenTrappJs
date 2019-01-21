export class AuthStatus {
  readonly loginUrl = '/api/v1/authentication/login';

  constructor(readonly displayName: string,
              readonly name: string,
              readonly email: string,
              readonly roles: string[],
              readonly accountType: string,
              readonly expiration: Date) {
  }
}

export class JWTPayload {
  readonly name: string;

  constructor(readonly displayName: string,
              readonly email: string,
              readonly roles: string[],
              readonly accountType: 'user' | 'service',
              readonly provider: string,
              readonly thirdPartyId?: string) {
    this.name = email.replace(/(@pragmatists\.pl|@pragmatists\.com)$/g, '');
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
  emails: { value: string; type: string }[];
  provider: string;
  _json: {
    domain: string;
    objectType: string;
    language: string;
  };
}
