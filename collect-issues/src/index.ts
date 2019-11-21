import * as core from '@actions/core';
import { GitHub, context } from '@actions/github';
import Octokit from '@octokit/rest';
import { toArray } from './utils/to-array';
import { createRegexpFromStrings } from './utils/create-regexp-from-strings';

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

/**
 * Filters issues by title and label filters. When an array of filters is passed
 * it is assumed that _some_ filter in the array has to match, not all
 */
const filterIssuesByLabelAndTitle = ({
  labelFilters,
  titleFilters,
  issues,
}: {
  labelFilters: string[];
  titleFilters: string[];
  issues: Octokit.SearchIssuesAndPullRequestsResponseItemsItem[];
}): Octokit.SearchIssuesAndPullRequestsResponseItemsItem[] => {
  const labelRegexp = labelFilters.length
    ? createRegexpFromStrings(labelFilters)
    : undefined;
  const titleRegexp = titleFilters.length
    ? createRegexpFromStrings(titleFilters)
    : undefined;

  return issues.filter(
    item =>
      (!labelRegexp ||
        item.labels.some(labelItem => labelRegexp.test(labelItem.name))) &&
      (!titleRegexp || titleRegexp.test(item.title)),
  );
};

export const run = async (): Promise<void> => {
  try {
    const resultEnvVariable = getParsedInput<string>('env-output-variable');
    const titleFilters = toArray(
      getParsedInput<string | string[]>('titlefilters'),
    );
    const labelFilters = toArray(
      getParsedInput<string | string[]>('labelFilters'),
    );
    const repoToken = getParsedInput<string>('repo-token');
    const github = new GitHub(repoToken);

    const query = `repo:${context.repo.owner}/${context.repo.repo} is:open is:issue`;
    console.log('Executing query:', query);
    const allIssues = await github.search.issuesAndPullRequests({
      q: query,
    });

    const filteredIssues = filterIssuesByLabelAndTitle({
      labelFilters,
      titleFilters,
      issues: allIssues.data.items,
    });
    const issueIds = filteredIssues.map(issue => issue.id);
    console.log(`Found ${issueIds.length} issues:`, issueIds);

    // Expose serialized result both as output and as environment variable so other actions can
    // consume it however they see fit.
    console.log('Exporting results...');
    const serializedOutput = JSON.stringify(issueIds);
    core.exportVariable(resultEnvVariable, serializedOutput);
    core.setOutput('issueids', serializedOutput);
  } catch (error) {
    core.setFailed(error.message);
  }
};

if (process.env.NODE_ENV !== 'test') {
  run();
}
