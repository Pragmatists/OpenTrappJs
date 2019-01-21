import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthStatus, RequestWithUser } from './auth.model';
import { AuthGuard } from '@nestjs/passport';
import { ApiUseTags } from '@nestjs/swagger';

@Controller('/api/v1/authentication')
@ApiUseTags('authentication')
export class AuthController {

  @Get('status')
  @UseGuards(AuthGuard('jwt'))
  public status(@Req() request: RequestWithUser): AuthStatus {
    const user = request.user;
    return new AuthStatus(user.displayName, user.name, user.roles, user.accountType, new Date(user.exp * 1000));
  }

  @Get('login/google')
  @UseGuards(AuthGuard('google'))
  login() {
    // initiates the Google OAuth2 login flow
  }

  @Get('login-callback')
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req, @Res() res) {
    // handles the Google OAuth2 callback
    const {jwt} = req.user;
    if (jwt) {
      res.redirect(`http://localhost:4200/login/success?token=${jwt}`);
    } else {
      res.redirect('http://localhost:4200/login/failure');
    }
  }
}
