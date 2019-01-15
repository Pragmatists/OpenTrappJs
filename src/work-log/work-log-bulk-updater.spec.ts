import { WorkLogBulkUpdater } from './work-log-bulk-updater';

describe('WorkLogBulkUpdater', () => {
  it('should parse expression correctly', () => {
    const expression = '+#projects -#in-progress +#done';
    const toAdd = ['projects', 'done'];
    const toRemove = ['in-progress'];

    const bulkUpdater = new WorkLogBulkUpdater(expression);

    expect(bulkUpdater.tagsToAdd).toEqual(toAdd);
    expect(bulkUpdater.tagsToRemove).toEqual(toRemove);
  });

  it('should ignore duplicates', () => {
    const expression = '+#projects -#in-progress +#done +#projects -#in-progress';
    const toAdd = ['projects', 'done'];
    const toRemove = ['in-progress'];

    const bulkUpdater = new WorkLogBulkUpdater(expression);

    expect(bulkUpdater.tagsToAdd).toEqual(toAdd);
    expect(bulkUpdater.tagsToRemove).toEqual(toRemove);
  });

  it('should throw exception for invalid expression', () => {
    const expression = '+#projects in-progress +#done +#projects --#in-progress';

    expect(() => new WorkLogBulkUpdater(expression)).toThrowError();
  });
});
