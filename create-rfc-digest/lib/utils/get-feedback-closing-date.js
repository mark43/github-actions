"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const get_value_for_marker_1 = require("./get-value-for-marker");
/**
 * Extracts a marked feedback closing date from a given string, e.g.:
 * `<!--fb_date_start-->11-20-2019<!--fb_date_end-->`
 * Expects a date in the format of MM-DD-YYYY
 * @param text
 */
exports.getFeedbackClosingDate = (text) => {
    const feedbackDate = get_value_for_marker_1.getValueForMarker('fb_date', text);
    // no date marker found
    if (!feedbackDate) {
        return undefined;
    }
    const dateStringMatch = feedbackDate.match(/(\d{2}-\d{2}-\d{4})/);
    // provided string not a valid date string
    if (!dateStringMatch) {
        return undefined;
    }
    // TODO less naive date formatting
    const date = new Date(dateStringMatch[1]);
    date.setHours(0);
    date.setMilliseconds(0);
    date.setSeconds(0);
    date.setMinutes(0);
    return date;
};
