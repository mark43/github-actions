import Octokit from '@octokit/rest';
import { getFeedbackClosingDate } from './utils/get-feedback-closing-date';
import endOfToday from 'date-fns/endOfToday';
import isBefore from 'date-fns/isBefore';

/**
 * Asserts that a Github issue contains a feedback data marker and that the date within
 * that marker is not expired
 * @param issue
 */
export const hasNonExpiredFeedbackDate = (
  issue: Octokit.IssuesGetResponse,
): boolean => {
  const date = getFeedbackClosingDate(issue.body);
  return !!date && !isNaN(Number(date)) && isBefore(date, endOfToday());
};
