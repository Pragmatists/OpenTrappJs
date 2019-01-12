import * as moment from 'moment';

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

  yearAndMonth(year: string, month: string): WorkLogSearchCriteria {
    if (year && month) {
      this.criteria = {...this.criteria, 'day.date': {$regex: `${year}/${month}/(\\d{2})`}};
    }
    return this;
  }

  build(): {[key: string]: any} {
    return this.criteria;
  }
}
