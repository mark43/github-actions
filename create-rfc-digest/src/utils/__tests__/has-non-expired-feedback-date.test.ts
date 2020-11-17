import Octokit from '@octokit/rest';
import { advanceTo, clear } from 'jest-date-mock';

import { hasNonExpiredFeedbackDate } from '../has-non-expired-feedback-date';

describe('hasNonExpiredFeedbackDate', () => {
  beforeEach(() => {
    advanceTo(new Date('2019-11-11'));
  });

  afterEach(clear);
  it('should return `true` for a date in the future', () => {
    expect(
      hasNonExpiredFeedbackDate(({
        body: `**Feedback closing date**: <!--fb_date_start-->_12-20-2019_<!--fb_date_end-->`,
      } as unknown) as Octokit.IssuesGetResponse),
    ).toBe(true);
  });

  it('should return `true` for a date on the same day', () => {
    expect(
      hasNonExpiredFeedbackDate(({
        body: `**Feedback closing date**: <!--fb_date_start-->_11-11-2019_<!--fb_date_end-->`,
      } as unknown) as Octokit.IssuesGetResponse),
    ).toBe(true);
  });

  it('should return `false` for a date in the past', () => {
    expect(
      hasNonExpiredFeedbackDate(({
        body: `**Feedback closing date**: <!--fb_date_start-->_10-11-2019_<!--fb_date_end-->`,
      } as unknown) as Octokit.IssuesGetResponse),
    ).toBe(false);
  });
});
