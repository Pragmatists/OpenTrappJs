import { Document } from 'mongoose';
import { IsArray, IsEmail } from 'class-validator';

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
