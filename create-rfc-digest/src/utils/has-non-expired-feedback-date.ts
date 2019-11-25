import Octokit from '@octokit/rest';
import { getFeedbackClosingDate } from './get-feedback-closing-date';
import endOfYesterday from 'date-fns/endOfYesterday';
import isAfter from 'date-fns/isAfter';

/**
 * Asserts that a Github issue contains a feedback data marker and that the date within
 * that marker is not expired
 * @param issue
 */
export const hasNonExpiredFeedbackDate = (
  issue: Octokit.IssuesGetResponse,
): boolean => {
  const date = getFeedbackClosingDate(issue.body);
  return !!date && !isNaN(Number(date)) && isAfter(date, endOfYesterday());
};
