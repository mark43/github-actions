import Octokit from '@octokit/rest';
import { advanceTo, clear } from 'jest-date-mock';

import { checkFeedbackDateExpiration } from '../check-feedback-date-expiration';

describe('checkFeedbackDateExpiration', () => {
  beforeEach(() => {
    advanceTo(new Date('2019-11-11'));
  });

  afterEach(clear);
  it('should handle a date in the future', () => {
    expect(
      checkFeedbackDateExpiration(({
        body: `**Feedback closing date**: <!--fb_date_start-->_12-20-2019_<!--fb_date_end-->`,
      } as unknown) as Octokit.IssuesGetResponse),
    ).toEqual({ hasDate: true, isExpired: false });
  });

  it('should handle a date on the same day', () => {
    expect(
      checkFeedbackDateExpiration(({
        body: `**Feedback closing date**: <!--fb_date_start-->_11-11-2019_<!--fb_date_end-->`,
      } as unknown) as Octokit.IssuesGetResponse),
    ).toEqual({ hasDate: true, isExpired: false });
  });

  it('should handle a date in the past', () => {
    expect(
      checkFeedbackDateExpiration(({
        body: `**Feedback closing date**: <!--fb_date_start-->_10-11-2019_<!--fb_date_end-->`,
      } as unknown) as Octokit.IssuesGetResponse),
    ).toEqual({ hasDate: true, isExpired: true });
  });

  it('should handle no date being found', () => {
    expect(
      checkFeedbackDateExpiration(({
        body: `**Feedback closing date**: _10-11-2019_`,
      } as unknown) as Octokit.IssuesGetResponse),
    ).toEqual({ hasDate: false, isExpired: false });
  });
});
