import { Controller, Get } from '@nestjs/common';

@Controller('.well-known')
export class WellKnownController {

  @Get('/acme-challenge/4J91U7BYFRTyquJPGjAbrdWFz9uJCzO8uTmZftr-Jn0')
  challenge(): string {
    return '4J91U7BYFRTyquJPGjAbrdWFz9uJCzO8uTmZftr-Jn0.pruGys6OV0ebrZfJFI0g5JIswbl4hoei8tf-huEvOHQ';
  }
}
