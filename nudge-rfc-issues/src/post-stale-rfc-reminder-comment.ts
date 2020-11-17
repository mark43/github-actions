import Octokit from '@octokit/rest';
import { GitHub } from '@actions/github';
import { Context } from '@actions/github/lib/context';

export function postStaleRfcReminderComment(
  issue: Octokit.IssuesGetResponse,
  context: Context,
  client: GitHub,
): Promise<Octokit.Response<Octokit.IssuesCreateCommentResponse>> {
  return client.issues.createComment({
    ...context.repo,
    // eslint-disable-next-line @typescript-eslint/camelcase
    issue_number: issue.number,
    body: `@${issue.user.login} Please extend the feedback date for this RFC or close it with a resolution, thank you! I will keep reminding you :)`,
  });
}
