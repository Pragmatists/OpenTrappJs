import { Injectable } from '@nestjs/common';

interface OauthServiceConfig {
  email: string;
  privateKey: string;
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
}
