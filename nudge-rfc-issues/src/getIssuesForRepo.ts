import Octokit from '@octokit/rest';
import { GitHub } from '@actions/github';
import { Context } from '@actions/github/lib/context';

export function getIssuesForRepo(
  issues: number[],
  context: Context,
  client: GitHub,
): Promise<Octokit.IssuesGetResponse[]> {
  // TODO serialize api requests?
  return Promise.all(
    issues.map(issueNumber =>
      client.issues
        .get({
          ...context.repo,
          // eslint-disable-next-line @typescript-eslint/camelcase
          issue_number: issueNumber,
        })
        .then(d => d.data),
    ),
  );
}
