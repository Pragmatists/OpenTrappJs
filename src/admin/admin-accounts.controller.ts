import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiUseTags, ApiBearerAuth } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { AuthorizedUserService } from '../accounts/authorized-user.service';
import { AuthorizedUserDTO, CreateAuthorizedUserDTO } from '../accounts/accounts.model';
import { RolesGuard } from '../shared/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../shared/roles.decorator';

@Controller('api/v1/admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiUseTags('admin-accounts')
@ApiBearerAuth()
export class AdminAccountsController {

  constructor(private readonly authorizedUserService: AuthorizedUserService) {
  }

  @Get('authorized-users')
  @Roles('ADMIN')
  authorizedUsers(): Observable<AuthorizedUserDTO[]> {
    return this.authorizedUserService.findAll();
  }

  @Post('authorized-users')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({transform: true}))
  updateAuthorizedUser(@Body() dto: CreateAuthorizedUserDTO): Observable<{}> {
    return this.authorizedUserService.updateAuthorizedUser(dto);
  }

}
