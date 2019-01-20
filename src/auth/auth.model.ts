export class AuthStatus {
  readonly loginUrl = '/api/v1/authentication/login';
  readonly logoutUrl = '/api/v1/authentication/logout';

  constructor(readonly username: string,
              readonly displayName: string,
              readonly authenticated: boolean,
              readonly email?: string,
              readonly accessToken?: string,
              readonly refreshToken?: string) {
  }

  static get ANONYMOUS() {
    return new AuthStatus('Anonymous', 'Anonymous', false);
  }
}

export interface RequestWithUser {
  user: {
    email: string;
    displayName: string;
    domain: string;
    accessToken: string;
    refreshToken: string;
  };
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
