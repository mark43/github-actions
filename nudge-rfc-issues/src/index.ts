import * as core from '@actions/core';
import { GitHub, context } from '@actions/github';

import { checkFeedbackDateExpiration } from './utils/check-feedback-date-expiration';
import { getIssuesForRepo } from './getIssuesForRepo';
import { postStaleRfcReminderComments } from './post-stale-rfc-reminder-comments';

/**
 * Gets action input and parses it as json
 * @param param
 * @param options
 */
const getParsedInput = <T>(
  param: string,
  options: core.InputOptions = {
    required: true,
  },
): T => {
  const input = core.getInput(param, options);
  try {
    const parsedInput = JSON.parse(input);
    return parsedInput as T;
  } catch (e) {
    throw new Error(`Failed parsing input for ${param}: ${e.message}`);
  }
};

export const run = async (): Promise<void> => {
  try {
    const rfcIssueNumbers = getParsedInput<number[]>('issue_numbers');
    const repoToken = core.getInput('repo-token', { required: true });
    const github = new GitHub(repoToken);

    console.log(`Loading data for issues: ${rfcIssueNumbers}`);
    const issues = await getIssuesForRepo(rfcIssueNumbers, context, github);
    const staleRfcIssues = issues.filter(
      // this will only include issue which have a date set which is in the past.
      // if no date is being found `isExpired` will be `false`
      issue => checkFeedbackDateExpiration(issue).isExpired,
    );
    console.log(
      `Posting on issues: ${staleRfcIssues.map(issue => issue.number)}`,
    );
    await postStaleRfcReminderComments(staleRfcIssues, context, github);
  } catch (error) {
    core.setFailed(error.message);
  }
};

if (process.env.NODE_ENV !== 'test') {
  run();
}
