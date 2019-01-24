import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import { Observable, from } from 'rxjs';

@Injectable()
export class BcryptService {
  private static readonly SALT_ROUNDS = 7;

  encrypt(plainText: string): Observable<string> {
    return from(hash(plainText, BcryptService.SALT_ROUNDS));
  }

  compare(plainText: string, hashedText: string): Observable<boolean> {
    return from(compare(plainText, hashedText));
  }
}
