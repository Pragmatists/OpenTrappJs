import { Injectable } from '@nestjs/common';

interface OauthServiceConfig {
  email: string;
  privateKey: string;
}

interface GoogleOAuthConfig {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
}

@Injectable()
export class ConfigService {
  get dbUri(): string {
    return process.env.OPEN_TRAPP_DB_URI;
  }

  get serviceAccountConfig(): OauthServiceConfig {
    const email = process.env.OPEN_TRAPP_OAUTH_EMAIL;
    const privateKey = process.env.OPEN_TRAPP_OAUTH_PRIVATE_KEY;
    return {email, privateKey};
  }

  get googleOAuthConfig(): GoogleOAuthConfig {
    const clientID = process.env.OPEN_TRAPP_OAUTH_CLIENT_ID;
    const clientSecret = process.env.OPEN_TRAPP_OAUTH_CLIENT_SECRET;
    const callbackURL = 'https://69d17427.ngrok.io/api/v1/authentication/login-callback';
    return {clientID, clientSecret, callbackURL};
  }
}
