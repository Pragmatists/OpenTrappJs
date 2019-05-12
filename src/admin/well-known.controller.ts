import { Controller, Get } from '@nestjs/common';

@Controller('.well-known')
export class WellKnownController {

  @Get('/acme-challenge/OMxwqKbxsJOamia1BwXsycfgQR3NuuS4AAGuHU56X7I')
  challenge(): string {
    return 'OMxwqKbxsJOamia1BwXsycfgQR3NuuS4AAGuHU56X7I._miMAj7WA2J3CqX_oviuH_Xq4Y1S3jZYca8QHoDTiwk';
  }
}
