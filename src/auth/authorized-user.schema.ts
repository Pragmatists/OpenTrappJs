import * as mongoose from 'mongoose';

export const AuthorizedUserSchema = new mongoose.Schema({
    email: String,
    roles: [String]
});