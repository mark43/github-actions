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
const create_rfc_attachment_from_issue_1 = require("./utils/create-rfc-attachment-from-issue");
const has_non_expired_feedback_date_1 = require("./utils/has-non-expired-feedback-date");
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
function formatRepo(context) {
    return `${context.repo.owner}/${context.repo.repo}`;
}
const getMessageForIssueCount = (count) => !count
    ? `There are no RFCs open for feedback right now in ${formatRepo(github_1.context)}`
    : `We have ${count} RFC${count > 1 ? 's' : ''} open for feedback in ${formatRepo(github_1.context)}`;
exports.run = async () => {
    try {
        const rfcIssueNumbers = getParsedInput('issue_numbers');
        const repoToken = core.getInput('repo-token', { required: true });
        const showAttachments = getParsedInput('show_attachments', {
            required: true,
        });
        const github = new github_1.GitHub(repoToken);
        console.log(`Loading data for issues: ${rfcIssueNumbers}`);
        // TODO serialize api requests?
        const allIssueData = await Promise.all(rfcIssueNumbers.map(issueNumber => github.issues
            .get({
            owner: github_1.context.repo.owner,
            repo: github_1.context.repo.repo,
            // eslint-disable-next-line @typescript-eslint/camelcase
            issue_number: issueNumber,
        })
            .then(d => d.data)));
        const issueAttachments = allIssueData
            .filter(has_non_expired_feedback_date_1.hasNonExpiredFeedbackDate)
            .map(create_rfc_attachment_from_issue_1.createRfcAttachmentFromIssue({ showAttachments }));
        // we do not provide a channel because we want to send to our default channel
        const output = {
            text: `:tada: *Daily RFC digest*\n${getMessageForIssueCount(issueAttachments.length)}`,
            attachments: issueAttachments,
        };
        console.log('Exporting message json...');
        core.setOutput('rfc_digest_message_json', JSON.stringify(output));
    }
    catch (error) {
        core.setFailed(error.message);
    }
};
if (process.env.NODE_ENV !== 'test') {
    exports.run();
}
