import { Injectable } from '@nestjs/common';
import { Model } from "mongoose";
import { InjectModel } from '@nestjs/mongoose';
import { Document } from 'mongoose';

interface AuthorizedUser extends Document {
  email: string;
  roles: string[];
}

@Injectable()
export class AuthorizedUserService {
  constructor(@InjectModel('AuthorizedUser') private readonly authorizedUserModel: Model<AuthorizedUser>) {
  }

  findByEmail(email: string): Promise<AuthorizedUser> {
    return this.authorizedUserModel.findOne({email}).exec();
  }
}
