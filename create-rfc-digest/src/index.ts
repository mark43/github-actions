import * as core from '@actions/core';
import { GitHub, context } from '@actions/github';
import { ChatPostMessageArguments } from '@slack/web-api';

import { createRfcAttachmentFromIssue } from './utils/create-rfc-attachment-from-issue';
import { hasNonExpiredFeedbackDate } from './utils/has-non-expired-feedback-date';

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

const getMessageForIssueCount = (count: number): string =>
  !count
    ? 'There are no open RFCs right now'
    : `We have ${count} RFC${count > 1 ? 's' : ''} open for feedback`;

export const run = async (): Promise<void> => {
  try {
    const rfcIssueNumbers = getParsedInput<number[]>('issue_numbers');
    console.log({ rfcIssueNumbers });
    const repoToken = core.getInput('repo-token', { required: true });
    const showAttachments = getParsedInput<boolean>('show_attachments', {
      required: true,
    });
    const github = new GitHub(repoToken);

    console.log(`Loading data for issues: ${rfcIssueNumbers}`);
    // TODO serialize api requests?
    const allIssueData = await Promise.all(
      rfcIssueNumbers.map(issueNumber =>
        github.issues
          .get({
            owner: context.repo.owner,
            repo: context.repo.repo,
            // eslint-disable-next-line @typescript-eslint/camelcase
            issue_number: issueNumber,
          })
          .then(d => d.data),
      ),
    );

    const issueAttachments = allIssueData
      .filter(hasNonExpiredFeedbackDate)
      .map(createRfcAttachmentFromIssue({ showAttachments }));

    // we do not provide a channel because we want to send to our default channel
    const output: Omit<ChatPostMessageArguments, 'channel'> = {
      text: `:tada: *Daily RFC digest*\n${getMessageForIssueCount(
        issueAttachments.length,
      )}`,
      attachments: issueAttachments,
    };

    console.log('Exporting message json...');
    core.setOutput('rfc_digest_message_json', JSON.stringify(output));
  } catch (error) {
    core.setFailed(error.message);
  }
};

if (process.env.NODE_ENV !== 'test') {
  run();
}
