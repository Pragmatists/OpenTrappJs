import { Controller, Get } from '@nestjs/common';

@Controller('.well-known')
export class WellKnownController {

  @Get('/acme-challenge/NjzKnIxBknMOiHWtRHnC9RcgyOSM15zvIIRcFzxYtWo')
  challenge(): string {
    return 'NjzKnIxBknMOiHWtRHnC9RcgyOSM15zvIIRcFzxYtWo.XsRtOsDNIrEGDwebfgZ71VDYXtmO4LXnTpAmbf6TIRY';
  }
}
