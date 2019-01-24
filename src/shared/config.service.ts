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

export interface JWTConfig {
  secret: string;
  expiresIn: number;
}

@Injectable()
export class ConfigService {
  private static TOKEN_EXPIRATION_TIME = 3600; // 1 hour

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
    const callbackURL = 'http://localhost:3000/api/v1/authentication/login-callback';
    return {clientID, clientSecret, callbackURL};
  }

  get jwtConfig(): JWTConfig {
    return {
      secret: process.env.OPEN_TRAPP_JWT_SECRET,
      expiresIn: ConfigService.TOKEN_EXPIRATION_TIME
    };
  }
}
