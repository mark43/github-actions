"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const get_feedback_closing_date_1 = require("./get-feedback-closing-date");
const endOfYesterday_1 = __importDefault(require("date-fns/endOfYesterday"));
const isAfter_1 = __importDefault(require("date-fns/isAfter"));
/**
 * Asserts that a Github issue contains a feedback data marker and that the date within
 * that marker is not expired
 * @param issue
 */
exports.hasNonExpiredFeedbackDate = (issue) => {
    const date = get_feedback_closing_date_1.getFeedbackClosingDate(issue.body);
    return !!date && !isNaN(Number(date)) && isAfter_1.default(date, endOfYesterday_1.default());
};
