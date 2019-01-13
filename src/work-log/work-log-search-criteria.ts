import * as moment from 'moment';
import { YearMonthDTO } from '../time-registration/calendar/calendar.model';

export class WorkLogSearchCriteria {
  private criteria: {[key: string]: any} = {};

  private constructor() {
  }

  static get builer(): WorkLogSearchCriteria {
    return new WorkLogSearchCriteria();
  }

  projectName(projectName: string): WorkLogSearchCriteria {
    if (projectName) {
      this.criteria = {...this.criteria, 'projectNames.name': projectName};
    }
    return this;
  }

  date(date: Date): WorkLogSearchCriteria {
    if (date) {
      this.criteria = {...this.criteria, 'day.date': moment(date).format('YYYY/MM/DD')};
    }
    return this;
  }

  user(user: string): WorkLogSearchCriteria {
    if (user) {
      this.criteria = {...this.criteria, 'employeeID._id': user};
    }
    return this;
  }

  month(yearMonth: YearMonthDTO): WorkLogSearchCriteria {
    if (yearMonth && yearMonth.month && yearMonth.year) {
      this.criteria = {...this.criteria, 'day.date': {$regex: yearMonth.searchRegex}};
    }
    return this;
  }

  monthList(monthList: YearMonthDTO[]): WorkLogSearchCriteria {
    if (monthList && monthList.length > 0) {
      const dateCriteria = monthList.map(m => `(${m.searchRegex})`).join('|');
      this.criteria = {...this.criteria, 'day.date': {$regex: dateCriteria}};
    }
    return this;
  }

  build(): {[key: string]: any} {
    return this.criteria;
  }
}
