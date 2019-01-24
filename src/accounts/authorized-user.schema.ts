import * as mongoose from 'mongoose';

export const AuthorizedUserSchema = new mongoose.Schema({
  email: String,
  name: {type: String, unique: true},
  roles: [String]
});
