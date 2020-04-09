import * as core from '@actions/core';
import { GitHub, context } from '@actions/github';

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

export async function run(): Promise<void> {
  const repoToken = getParsedInput<string>('repo-token');
  const github = new GitHub(repoToken);
  const issueNumber = context.payload.issue?.number;

  if (issueNumber) {
    const response = await github.issues.get({
      issue_number: issueNumber,
      owner: context.repo.owner,
      repo: context.repo.repo,
    });
    const issue = response.data;
    if (issue.labels.find((label) => label.name === 'help')) {
      let messageText;
      if (context.eventName === 'issues') {
        switch (context.action) {
          case 'opened':
            messageText = `${issue.html_url} opened`;
            break;
          case 'closed':
            messageText = `${issue.html_url} closed`;
            break;
        }
      } else if (context.eventName === 'issue_comment') {
        messageText = context.payload.comment.html_url;
      }

      if (messageText) {
        const message = { text: messageText };
        core.setOutput('issue_message_json', JSON.stringify(message));
      }
    }
  }
}

if (process.env.NODE_ENV !== 'test') {
  run();
}
