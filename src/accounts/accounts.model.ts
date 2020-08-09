import { Document } from 'mongoose';
import { IsArray, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export interface AuthorizedUser extends Document {
  email: string;
  name: string;
  roles: string[];
}

export interface AuthorizedUserDTO {
  email: string;
  name: string;
  roles: string[];
}

export class CreateAuthorizedUserDTO {
  @IsEmail()
  @ApiProperty({example: 'john.doe@pragmatists.pl'})
  email: string;
  @IsArray()
  @ApiProperty({
    isArray: true,
    type: [String],
    example: ['ADMIN'],
    uniqueItems: true,
    description: 'Allows to add, modify or remove user roles. If list is empty user will have only "USER" role'
  })
  roles: string[];
}

export interface ServiceAccount extends Document {
  name: string;
  clientID: string;
  secret: string;
  owner: string;
}

export interface ServiceAccountDTO {
  name: string;
  clientID: string;
  owner: string;
}

export class CreateServiceAccountDTO {
  @IsNotEmpty()
  @ApiProperty({example: 'My service account'})
  name: string;
}

export interface CreateServiceAccountResponse {
  clientID: string;
  secret: string;
}
