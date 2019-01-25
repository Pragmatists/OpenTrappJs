import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthStatus, RequestWithUser, ServiceAccountTokenRequestDTO, ServiceAccountTokenResponseDTO } from './auth.model';
import { AuthGuard } from '@nestjs/passport';
import { ApiUseTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Controller('/api/v1/authentication')
@ApiUseTags('authentication')
export class AuthController {

  constructor(private readonly authService: AuthService) {
  }

  @Get('status')
  @UseGuards(AuthGuard('jwt'))
  public status(@Req() request: RequestWithUser): AuthStatus {
    const user = request.user;
    return new AuthStatus(
      user.displayName,
      user.name, user.email,
      user.roles,
      user.accountType,
      new Date(user.exp * 1000)
    );
  }

  @Post('token')
  @UsePipes(new ValidationPipe({transform: true}))
  @HttpCode(HttpStatus.OK)
  tokenForServiceAccount(@Body() tokenRequestBody: ServiceAccountTokenRequestDTO): Observable<ServiceAccountTokenResponseDTO> {
    return this.authService.tokenForServiceAccount(tokenRequestBody);
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
