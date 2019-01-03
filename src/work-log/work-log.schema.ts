import * as mongoose from 'mongoose';

export const WorkLogSchema = new mongoose.Schema({
    _id: {
        _id: String
    },
    _class: {type: String, default: 'com.github.mpi.time_registration.domain.WorkLogEntry'},
    employeeID: {
        _id: String
    },
    day: {
        date: String
    },
    workload: {
        minutes: Number
    },
    projectNames: [
        {
            name: String
        }
    ],
    createdAt: Date,
    note: {
        text: String
    }
});