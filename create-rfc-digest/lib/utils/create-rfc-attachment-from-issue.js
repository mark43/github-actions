"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const format_1 = __importDefault(require("date-fns/format"));
const get_feedback_closing_date_1 = require("./get-feedback-closing-date");
/**
 * Creates a RFC slack attachment from a Github issue response
 * @param issue
 */
exports.createRfcAttachmentFromIssue = (issue) => {
    const feedbackClosingDate = get_feedback_closing_date_1.getFeedbackClosingDate(issue.body);
    // TODO allow for more custom meta data via tags in description
    const fields = [
        feedbackClosingDate &&
            {
                title: 'Feedback closing date',
                value: format_1.default(feedbackClosingDate, 'MM-dd-yyyy'),
                short: false,
            },
    ].filter((x) => !!x);
    return {
        fallback: `${issue.title} RFC by ${issue.user.login}: ${issue.html_url}`,
        color: '#0077a5',
        // eslint-disable-next-line @typescript-eslint/camelcase
        author_name: issue.user.login,
        // eslint-disable-next-line @typescript-eslint/camelcase
        author_link: issue.user.html_url,
        // eslint-disable-next-line @typescript-eslint/camelcase
        author_icon: issue.user.avatar_url,
        title: issue.title,
        // eslint-disable-next-line @typescript-eslint/camelcase
        title_link: issue.html_url,
        fields,
        ts: Date.now().toString(),
    };
};
