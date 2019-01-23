import * as mongoose from 'mongoose';

export const ServiceAccountSchema = new mongoose.Schema({
  name: {type: String, unique: true},
  clientID: {type: String, unique: true},
  secret: String,
  owner: String
});
