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
async function run() {
    var _a;
    const repoToken = getParsedInput('repo-token');
    const github = new github_1.GitHub(repoToken);
    const issueNumber = (_a = github_1.context.payload.issue) === null || _a === void 0 ? void 0 : _a.number;
    if (issueNumber) {
        const response = await github.issues.get({
            issue_number: issueNumber,
            owner: github_1.context.repo.owner,
            repo: github_1.context.repo.repo,
        });
        const issue = response.data;
        if (issue.labels.find((label) => label.name === 'help')) {
            let messageText;
            if (github_1.context.eventName === 'issues') {
                switch (github_1.context.action) {
                    case 'opened':
                        messageText = `${issue.html_url} opened`;
                        break;
                    case 'closed':
                        messageText = `${issue.html_url} closed`;
                        break;
                }
            }
            else if (github_1.context.eventName === 'issue_comment') {
                messageText = github_1.context.payload.comment.html_url;
            }
            if (messageText) {
                const message = { text: messageText };
                core.setOutput('issue_message_json', JSON.stringify(message));
            }
        }
    }
}
exports.run = run;
if (process.env.NODE_ENV !== 'test') {
    run();
}
