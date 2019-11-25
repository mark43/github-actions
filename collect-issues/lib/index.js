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
const to_array_1 = require("./utils/to-array");
const create_regexp_from_strings_1 = require("./utils/create-regexp-from-strings");
/**
 * Gets action input and parses it as json
 * @param param
 * @param options
 */
const getParsedInput = (param, options = {
    required: true,
}) => {
    const input = core.getInput(param, options);
    try {
        const parsedInput = JSON.parse(input);
        return parsedInput;
    }
    catch (e) {
        throw new Error(`Failed parsing input for ${param}: ${e.message}`);
    }
};
/**
 * Filters issues by title and label filters. When an array of filters is passed
 * it is assumed that _some_ filter in the array has to match, not all
 */
const filterIssuesByLabelAndTitle = ({ labelFilters, titleFilters, issues, }) => {
    const labelRegexp = labelFilters.length
        ? create_regexp_from_strings_1.createRegexpFromStrings(labelFilters)
        : undefined;
    const titleRegexp = titleFilters.length
        ? create_regexp_from_strings_1.createRegexpFromStrings(titleFilters)
        : undefined;
    return issues.filter(item => (!labelRegexp ||
        item.labels.some(labelItem => labelRegexp.test(labelItem.name))) &&
        (!titleRegexp || titleRegexp.test(item.title)));
};
exports.run = async () => {
    try {
        const resultEnvVariable = getParsedInput('env-output-variable');
        const titleFilters = to_array_1.toArray(getParsedInput('titlefilters'));
        const labelFilters = to_array_1.toArray(getParsedInput('labelFilters'));
        const repoToken = getParsedInput('repo-token');
        const github = new github_1.GitHub(repoToken);
        const query = `repo:${github_1.context.repo.owner}/${github_1.context.repo.repo} is:open is:issue`;
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
    }
    catch (error) {
        core.setFailed(error.message);
    }
};
if (process.env.NODE_ENV !== 'test') {
    exports.run();
}
