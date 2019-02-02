import { Injectable } from '@nestjs/common';
import { ConfigService } from '../shared/config.service';
import { OAuth2Client } from 'google-auth-library';
import { from, Observable } from 'rxjs';
import { TokenPayload } from 'google-auth-library/build/src/auth/loginticket';
import { map } from 'rxjs/operators';

@Injectable()
export class GoogleClient {
  private readonly googleClientID: string;
  private readonly googleClient: OAuth2Client;

  constructor(configService: ConfigService) {
    this.googleClientID = configService.googleOAuthConfig.clientID;
    this.googleClient = new OAuth2Client(configService.googleOAuthConfig.clientID);
  }

  verifyToken(token: string): Observable<TokenPayload> {
    return from(this.googleClient.verifyIdToken({
      idToken: token,
      audience: this.googleClientID
    })).pipe(
      map(ticket => ticket.getPayload())
    );
  }
}
