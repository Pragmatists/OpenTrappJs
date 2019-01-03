import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {

    get dbUri(): string {
        return process.env.OPEN_TRAPP_DB_URI;
    }
}
