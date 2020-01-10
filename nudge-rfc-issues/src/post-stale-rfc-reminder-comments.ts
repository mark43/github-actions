import Octokit from '@octokit/rest';
import { GitHub } from '@actions/github';
import { Context } from '@actions/github/lib/context';
import { postStaleRfcReminderComment } from './post-stale-rfc-reminder-comment';

export function postStaleRfcReminderComments(
  issues: Octokit.IssuesGetResponse[],
  context: Context,
  client: GitHub,
): Promise<Octokit.Response<Octokit.IssuesCreateCommentResponse>[]> {
  return Promise.all(
    issues.map(issue => postStaleRfcReminderComment(issue, context, client)),
  );
}
