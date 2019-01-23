import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JWT } from 'google-auth-library';
import { ConfigService } from '../shared/config.service';
import { AuthorizedUserService } from '../accounts/authorized-user.service';

export interface AuthorizedUser {
  email: string;
  roles: string[];
}

@Injectable()
export class AuthService {
  private oauth2Client: JWT;

  constructor(configService: ConfigService, private readonly userService: AuthorizedUserService) {
    const config = configService.serviceAccountConfig;
    this.oauth2Client = new JWT(config.email, null, config.privateKey);
  }

  async validateUser(token: string): Promise<AuthorizedUser> {
    const info = await this.getTokenInfo(token);
    if (!info) {
      throw new UnauthorizedException(`Invalid token ${token}`);
    }
    const user = await this.userService.findByEmail(info.email);
    if (!this.isUserValid(user)) {
      throw new UnauthorizedException(`Unauthorized user for ${info.email}`);
    }
    return {
      email: info.email,
      roles: user.roles
    };
  }

  private isUserValid(user: AuthorizedUser): boolean {
    if (!user) {
      return false;
    }
    return user.roles.some(role => role === 'ROLE_ADMIN');
  }

  private async getTokenInfo(token: string): Promise<any> {
    try {
      return await this.oauth2Client.getTokenInfo(token);
    } catch (e) {
      return undefined;
    }
  }
}
