import { Body, Controller, Get, NotFoundException, Param, Put, UseGuards } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/roles.guard';
import { Roles } from '../shared/roles.decorator';
import { filter, throwIfEmpty } from 'rxjs/operators';
import { isNil } from '@nestjs/common/utils/shared.utils';

class UpdateChallengeDTO {
  readonly secret: string;
}

@Controller('.well-known')
export class WellKnownController {
  private challengesMap: {[key: string]: string} = {
    'EDD020FD320D44BCB25FE004180CA6B3.txt': '14FB839C80DAB408047CD564DA76BC419CBF6766E04E28A6474BD0C594F98DDE\n' +
      'comodoca.com\n' +
      '1cce11aa473fb1a'
  };

  @Get('/pki-validation/:key')
  challenge(@Param('key') key: string): Observable<string> {
    return of(this.challengesMap[key])
      .pipe(
        filter(v => !isNil(v)),
        throwIfEmpty(() => new NotFoundException('Secret is not set'))
      );
  }

  @Put('/pki-validation/:key')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  setChallenge(@Param('key') key: string, @Body() updateDTO: UpdateChallengeDTO) {
    return new Observable(subscriber => {
      this.challengesMap[key] = updateDTO.secret;
      subscriber.next({});
      subscriber.complete();
    });
  }
}
