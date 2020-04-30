import * as mongoose from 'mongoose';

export const CustomerTokenSchema = new mongoose.Schema({
    customerName: {
        type: String
    },
    tags: {
        type: [String]
    },
    token: {
        type: String
    },
});
