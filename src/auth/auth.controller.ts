import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards, UsePipes, ValidationPipe, Headers } from '@nestjs/common';
import {
  AuthStatus,
  RequestWithUser,
  ServiceAccountTokenRequestDTO,
  ServiceAccountTokenResponseDTO,
  UserTokenResponseDTO
} from './auth.model';
import { AuthGuard } from '@nestjs/passport';
import { ApiUseTags, ApiBearerAuth } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Controller('api/v1/authentication')
@ApiUseTags('authentication')
export class AuthController {

  constructor(private readonly authService: AuthService) {
  }

  @Get('status')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
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

  @Post('service-token')
  @UsePipes(new ValidationPipe({transform: true}))
  @HttpCode(HttpStatus.OK)
  tokenForServiceAccount(@Body() tokenRequestBody: ServiceAccountTokenRequestDTO): Observable<ServiceAccountTokenResponseDTO> {
    return this.authService.tokenForServiceAccount(tokenRequestBody);
  }

  @Get('user-token')
  tokenForUser(@Headers('id-token') authorization: string): Observable<UserTokenResponseDTO> {
    return this.authService.tokenForUser(authorization);
  }
}
