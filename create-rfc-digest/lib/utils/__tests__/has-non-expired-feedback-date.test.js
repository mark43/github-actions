"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jest_date_mock_1 = require("jest-date-mock");
const has_non_expired_feedback_date_1 = require("../has-non-expired-feedback-date");
describe('hasNonExpiredFeedbackDate', () => {
    beforeEach(() => {
        jest_date_mock_1.advanceTo(new Date('2019-11-11'));
    });
    afterEach(jest_date_mock_1.clear);
    it('should return `true` for a date in the future', () => {
        expect(has_non_expired_feedback_date_1.hasNonExpiredFeedbackDate({
            body: `**Feedback closing date**: <!--fb_date_start-->_12-20-2019_<!--fb_date_end-->`,
        })).toBe(true);
    });
    it('should return `true` for a date on the same day', () => {
        expect(has_non_expired_feedback_date_1.hasNonExpiredFeedbackDate({
            body: `**Feedback closing date**: <!--fb_date_start-->_11-11-2019_<!--fb_date_end-->`,
        })).toBe(true);
    });
    it('should return `false` for a date in the past', () => {
        expect(has_non_expired_feedback_date_1.hasNonExpiredFeedbackDate({
            body: `**Feedback closing date**: <!--fb_date_start-->_10-11-2019_<!--fb_date_end-->`,
        })).toBe(false);
    });
});
