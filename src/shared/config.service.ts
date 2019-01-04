import { Injectable } from '@nestjs/common';
import {sync as loadJson} from 'load-json-file';

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
    const filePath = process.env.OPEN_TRAPP_OAUTH_CONFIG;
    const serviceAccount = loadJson<{client_email: string, private_key: string}>(filePath);
    return {
      email: serviceAccount.client_email,
      privateKey: serviceAccount.private_key
    }
  }
}
