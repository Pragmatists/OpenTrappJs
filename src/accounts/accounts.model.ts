import { Document } from 'mongoose';
import { IsArray, IsEmail, IsNotEmpty } from 'class-validator';

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
  email: string;
  @IsArray()
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
  secret: string;
  owner: string;
}

export class CreateServiceAccountDTO {
  @IsNotEmpty()
  name: string;
}

export interface CreateServiceAccountResponse {
  clientID: string;
  secret: string;
}
