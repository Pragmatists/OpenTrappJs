import * as moment from 'moment';
import { TimeUnit } from './time-unit';

export class WorkLogSearchCriteria {
  private criteria: {[key: string]: any} = {};

  private constructor() {
  }

  static get builder(): WorkLogSearchCriteria {
    return new WorkLogSearchCriteria();
  }

  projectName(projectName: string): WorkLogSearchCriteria {
    if (projectName) {
      this.criteria = {...this.criteria, 'projectNames.name': projectName};
    }
    return this;
  }

  projectNameList(projectNames: string[]): WorkLogSearchCriteria {
    if (projectNames && projectNames.length > 0) {
      this.criteria = {...this.criteria, 'projectNames.name': {$in: projectNames}};
    }
    return this;
  }

  date(date: Date): WorkLogSearchCriteria {
    if (date) {
      this.criteria = {...this.criteria, 'day.date': this.formatDate(date)};
    }
    return this;
  }

  dateRange(dateFrom: Date, dateTo: Date) {
    if (dateFrom && dateTo) {
      this.criteria = {...this.criteria, 'day.date': {$gte: this.formatDate(dateFrom), $lte: this.formatDate(dateTo)}};
    } else if (dateFrom) {
      this.criteria = {...this.criteria, 'day.date': {$gte: this.formatDate(dateFrom)}};
    } else if (dateTo) {
      this.criteria = {...this.criteria, 'day.date': {$lte: this.formatDate(dateTo)}};
    }
    return this;
  }

  user(user: string): WorkLogSearchCriteria {
    if (user) {
      this.criteria = {...this.criteria, 'employeeID._id': user};
    }
    return this;
  }

  userList(userList: string[]): WorkLogSearchCriteria {
    if (userList && userList.length > 0) {
      this.criteria = {...this.criteria, 'employeeID._id': {$in: userList}};
    }
    return this;
  }

  timeUnit(timeUnit: TimeUnit): WorkLogSearchCriteria {
    if (timeUnit) {
      this.criteria = {...this.criteria, 'day.date': {$regex: timeUnit.searchRegex}};
    }
    return this;
  }

  timeUnits(timeUnits: TimeUnit[]): WorkLogSearchCriteria {
    if (timeUnits && timeUnits.length > 0) {
      const dateCriteria = timeUnits.map(m => `(${m.searchRegex})`).join('|');
      this.criteria = {...this.criteria, 'day.date': {$regex: dateCriteria}};
    }
    return this;
  }

  build(): {[key: string]: any} {
    return this.criteria;
  }

  private formatDate(date: Date): string {
    return moment(date).format('YYYY/MM/DD');
  }
}
