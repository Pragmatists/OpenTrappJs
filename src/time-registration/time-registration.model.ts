import { WorkLogDTO } from '../work-log/work-log.model';

export class ReportingWorkLogDTO {
  readonly link: string;

  constructor(readonly id: string,
              readonly workload: string,
              readonly projectNames: string[],
              readonly employee: string,
              readonly day: string) {
    this.link = `/api/v1/work-log/entries/${id}`;
  }

  static fromWorkLog(workLog: WorkLogDTO) {
    return new ReportingWorkLogDTO(
      workLog.id, `${workLog.workload}`, workLog.projectNames, workLog.employeeID, workLog.day
    );
  }
}

export interface ReportingResponseDTO {
  items: ReportingWorkLogDTO[];
}
