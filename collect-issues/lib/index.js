"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
function getParsedInput(param, options) {
    const input = core.getInput(param, options);
    try {
        const parsedInput = JSON.parse(input);
        return parsedInput;
    }
    catch (e) {
        throw new Error(`Failed parsing input for ${param}: ${e.message}`);
    }
}
function toArray(data) {
    if (Array.isArray(data)) {
        return data;
    }
    return [data];
}
function cartesianProduct(a, b) {
    if (!a.length && !b.length) {
        return [];
    }
    const outer = a.length ? a : b;
    const inner = a.length ? b : a;
    return outer.flatMap(item => {
        return inner.length ? inner.map(innerItem => [item, innerItem]) : [[item]];
    });
}
function getQueryTuples(titleFilters, labelFilters) {
    const titleFilterArray = toArray(titleFilters).map(title => `${title} in:title`);
    const labelFilterArray = toArray(labelFilters).map(label => `label:${label}`);
    return cartesianProduct(titleFilterArray, labelFilterArray);
}
async function run() {
    try {
        const resultEnvVariable = getParsedInput("env-output-variable", {
            required: true
        });
        const titleFilters = getParsedInput("titlefilters", {
            required: true
        });
        const labelFilters = getParsedInput("labelFilters", {
            required: true
        });
        const repoToken = getParsedInput("repo-token", { required: true });
        const searchQueries = getQueryTuples(titleFilters, labelFilters);
        const github = new github_1.GitHub(repoToken);
        // NOTE: the github api does not support querying by multiple labels at the same time and treating the condition
        // as a boolean OR. Because of this we have to generate the cartesian product between title filters and label filters
        // and execute a search for each of them. This is not ideal as the number of requests can quickly grow
        // We might want to execute these request sequentially instead of in parallel to prevent hammering the api.
        // Currently we do not support paging through search results, as we expect each query to return less than 100 results
        // Note: Github actions have a limit of 1000 api requests per hour across all actions.
        const allIssues = await Promise.all(searchQueries.map(queryTuple => {
            console.log(`Pulling issues for query: ${queryTuple.join(" ")}...`);
            return github.search.issuesAndPullRequests({
                q: `in:${github_1.context.repo.owner}/${github_1.context.repo.repo} is:open is:issue ${queryTuple.join(" ")}`
            });
        }));
        const issueIds = allIssues.flatMap(issues => issues.data.items.map(issue => issue.id));
        console.log(`Found ${issueIds.length} issues:`, issueIds);
        // Expose serialized result both as output and as environment variable so other actions can
        // consume it however they see fit.
        console.log("Exporting results...");
        const serializedOutput = JSON.stringify(issueIds);
        core.exportVariable(resultEnvVariable, serializedOutput);
        core.setOutput("issueids", serializedOutput);
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
run();
