import {Document} from 'mongoose';

export interface CustomerTokenDTO {
    customerName: string;
    tags: string[];
    token: string;
}

export interface CustomerToken extends Document, CustomerTokenDTO {
    _id: string;
    _class: string;
}
