import {Controller, Get, Req, Res, UseGuards} from '@nestjs/common';
import {AuthStatus, RequestWithUser} from './auth.model';
import {AuthService} from './auth.service';
import {AuthGuard} from '@nestjs/passport';

@Controller('/endpoints/v1/authentication')
export class AuthController {

  constructor(private readonly authService: AuthService) {
  }

  @Get('status')
  public status(@Req() request: RequestWithUser): AuthStatus {
    const user = request.user;
    if (!user) {
      return AuthStatus.ANONYMOUS;
    }
    return new AuthStatus(user.email, user.displayName, true, user.email, user.accessToken, user.refreshToken);
  }

  @Get('login')
  @UseGuards(AuthGuard('google'))
  login() {
    // initiates the Google OAuth2 login flow
  }

  @Get('login-callback')
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req, @Res() res) {
    // handles the Google OAuth2 callback
    const jwt: string = req.user.accessToken;
    if (jwt) {
      res.redirect('/endpoints/v1/authentication/status');
    } else {
      res.redirect('http://localhost:4200/login/failure');
    }
  }
}
