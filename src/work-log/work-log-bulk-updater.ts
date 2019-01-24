import { uniq } from 'lodash';

export class WorkLogBulkUpdater {
  static readonly EXPRESSION_PATTERN = /^(\+#([^\s]*)|\-#([^\s]*))(\+#([^\s]*)|\-#([^\s]*)|\s)*$/;
  private readonly removePattern = /\-#([^\s]*)/g;
  private readonly addPattern = /\+#([^\s]*)/g;

  readonly tagsToAdd: string[];
  readonly tagsToRemove: string[];

  constructor(expression: string) {
    if (!WorkLogBulkUpdater.EXPRESSION_PATTERN.test(expression)) {
      throw new Error(`Invalid WorkLog update expression: ${expression}`);
    }
    this.tagsToAdd = uniq(WorkLogBulkUpdater.findByPattern(expression, this.addPattern));
    this.tagsToRemove = uniq(WorkLogBulkUpdater.findByPattern(expression, this.removePattern));
  }

  get removeQuery() {
    return {
      $pull: {projectNames: {name: {$in: this.tagsToRemove}}}
    };
  }

  get addQuery() {
    return {
      $addToSet: {projectNames: {$each: this.tagsToAdd.map(name => ({name}))}}
    };
  }

  private static findByPattern(expression: string, pattern: RegExp): string[] {
    const match = pattern.exec(expression);
    if (!match) {
      return [];
    }
    return [match[1], ...WorkLogBulkUpdater.findByPattern(expression, pattern)];
  }
}
