import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiUseTags, ApiBearerAuth } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { AuthorizedUserService } from '../accounts/authorized-user.service';
import {
  AuthorizedUserDTO,
  CreateAuthorizedUserDTO,
  CreateServiceAccountDTO,
  CreateServiceAccountResponse,
  ServiceAccountDTO
} from '../accounts/accounts.model';
import { RolesGuard } from '../shared/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../shared/roles.decorator';
import { ServiceAccountService } from '../accounts/service-account.service';
import { RequestWithUser } from '../auth/auth.model';
import { CanDeleteServiceAccountGuard } from './can-delete-service-account.guard';

@Controller('api/v1/admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiUseTags('admin-accounts')
@ApiBearerAuth()
export class AdminAccountsController {

  constructor(private readonly authorizedUserService: AuthorizedUserService,
              private readonly serviceAccountService: ServiceAccountService) {
  }

  @Get('service-accounts')
  @Roles('ADMIN')
  serviceAccounts(): Observable<ServiceAccountDTO[]> {
    return this.serviceAccountService.findAll();
  }

  @Post('service-accounts')
  @Roles('ADMIN')
  createServiceAccount(@Body() dto: CreateServiceAccountDTO,
                       @Req() request: RequestWithUser): Observable<CreateServiceAccountResponse> {
    const username = request.user.name;
    return this.serviceAccountService.create(dto, username);
  }

  @Delete('service-accounts/:id')
  @Roles('ADMIN')
  @UseGuards(CanDeleteServiceAccountGuard)
  deleteServiceAccount(@Param('id') id: string) {
    return this.serviceAccountService.delete(id);
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
