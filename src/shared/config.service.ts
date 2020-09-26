import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

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
  private static TOKEN_EXPIRATION_TIME = 30 * 24 * 60 * 60; // 30 days
  private static JWT_SECRET = uuid();

  get dbUri(): string {
    return process.env.OPEN_TRAPP_DB_URI;
  }

  get googleOAuthConfig(): GoogleOAuthConfig {
    const clientID = process.env.OPEN_TRAPP_OAUTH_CLIENT_ID;
    const clientSecret = process.env.OPEN_TRAPP_OAUTH_CLIENT_SECRET;
    const callbackURL = `${process.env.OPEN_TRAPP_SERVER_URL}/api/v1/authentication/login-callback`;
    return {clientID, clientSecret, callbackURL};
  }

  get jwtConfig(): JWTConfig {
    return {
      secret: ConfigService.JWT_SECRET,
      expiresIn: ConfigService.TOKEN_EXPIRATION_TIME
    };
  }
}
