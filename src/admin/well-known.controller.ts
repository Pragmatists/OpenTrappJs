import { Controller, Get } from '@nestjs/common';

@Controller('.well-known')
export class WellKnownController {

  @Get('/acme-challenge/w894fVhSsQXHCmEyLnWb0kMRa7bq200b_go8jRH7t5s')
  challenge(): string {
    return 'w894fVhSsQXHCmEyLnWb0kMRa7bq200b_go8jRH7t5s._miMAj7WA2J3CqX_oviuH_Xq4Y1S3jZYca8QHoDTiwk';
  }
}
