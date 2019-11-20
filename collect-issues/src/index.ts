import * as core from "@actions/core";
import { GitHub, context } from "@actions/github";

function getParsedInput<T>(param: string, options?: core.InputOptions): T {
  const input = core.getInput(param, options);

  try {
    const parsedInput = JSON.parse(input);
    return parsedInput as T;
  } catch (e) {
    throw new Error(`Failed parsing input for ${param}: ${e.message}`);
  }
}

function toArray<T>(data: T | T[]): T[] {
  if (Array.isArray(data)) {
    return data;
  }

  return [data];
}

function cartesianProduct<T>(a: T[], b: T[]): T[][] {
  if (!a.length && !b.length) {
    return [];
  }

  const outer: T[] = a.length ? a : b;
  const inner: T[] = a.length ? b : a;

  return outer.flatMap(item => {
    return inner.length ? inner.map(innerItem => [item, innerItem]) : [[item]];
  });
}

function getQueryTuples(
  titleFilters: string | string[],
  labelFilters: string | string[]
): string[][] {
  const titleFilterArray = toArray(titleFilters).map(
    title => `${title} in:title`
  );
  const labelFilterArray = toArray(labelFilters).map(label => `label:${label}`);
  return cartesianProduct(titleFilterArray, labelFilterArray);
}

async function run() {
  try {
    const resultEnvVariable = getParsedInput<string>("env-output-variable", {
      required: true
    });
    const titleFilters = getParsedInput<string | string[]>("titlefilters", {
      required: true
    });
    const labelFilters = getParsedInput<string | string[]>("labelFilters", {
      required: true
    });
    const repoToken = getParsedInput<string>("repo-token", { required: true });

    const searchQueries = getQueryTuples(titleFilters, labelFilters);
    const github = new GitHub(repoToken);

    // NOTE: the github api does not support querying by multiple labels at the same time and treating the condition
    // as a boolean OR. Because of this we have to generate the cartesian product between title filters and label filters
    // and execute a search for each of them. This is not ideal as the number of requests can quickly grow
    // We might want to execute these request sequentially instead of in parallel to prevent hammering the api.
    // Currently we do not support paging through search results, as we expect each query to return less than 100 results
    // Note: Github actions have a limit of 1000 api requests per hour across all actions.
    const allIssues = await Promise.all(
      searchQueries.map(queryTuple => {
        console.log(`Pulling issues for query: ${queryTuple.join(" ")}...`);
        return github.search.issuesAndPullRequests({
          q: `in:${context.repo.owner}/${
            context.repo.repo
          } is:open is:issue ${queryTuple.join(" ")}`
        });
      })
    );

    const issueIds = allIssues.flatMap(issues =>
      issues.data.items.map(issue => issue.id)
    );

    console.log(`Found ${issueIds.length} issues:`, issueIds);

    // Expose serialized result both as output and as environment variable so other actions can
    // consume it however they see fit.
    console.log("Exporting results...");
    const serializedOutput = JSON.stringify(issueIds);
    core.exportVariable(resultEnvVariable, serializedOutput);
    core.setOutput("issueids", serializedOutput);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
