
export interface WorkLog {
    _id: {
        _id: string
    },
    _class: string,
    employeeID: {
        _id: string
    },
    day: {
        date: string
    },
    workload: {
        minutes: number
    },
    projectNames: { name: string }[],
    createdAt: Date
}

export interface WorkLogDTO {
    id: string;
    employeeID: string;
    day: string;
    workload: number;
    projectNames: string[];
}
