"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const get_feedback_closing_date_1 = require("./utils/get-feedback-closing-date");
const endOfToday_1 = __importDefault(require("date-fns/endOfToday"));
const isBefore_1 = __importDefault(require("date-fns/isBefore"));
/**
 * Asserts that a Github issue contains a feedback data marker and that the date within
 * that marker is not expired
 * @param issue
 */
exports.hasNonExpiredFeedbackDate = (issue) => {
    const date = get_feedback_closing_date_1.getFeedbackClosingDate(issue.body);
    return !!date && !isNaN(Number(date)) && isBefore_1.default(date, endOfToday_1.default());
};
