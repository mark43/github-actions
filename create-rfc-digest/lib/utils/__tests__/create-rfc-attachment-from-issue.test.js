"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_rfc_attachment_from_issue_1 = require("../create-rfc-attachment-from-issue");
describe('create-rfc-attachment-from-issue', () => {
    it('should create an attachment', () => {
        const issue = {
            title: 'Testtitle',
            // eslint-disable-next-line @typescript-eslint/camelcase
            html_url: 'example.com/issue',
            user: {
                // eslint-disable-next-line @typescript-eslint/camelcase
                avatar_url: 'example.com/avatar',
                // eslint-disable-next-line @typescript-eslint/camelcase
                html_url: 'example.com/profile',
                login: 'test_user',
            },
            body: 'Testing this',
        };
        expect(create_rfc_attachment_from_issue_1.createRfcAttachmentFromIssue(issue)).toMatchObject({
            fallback: `Testtitle RFC by test_user: example.com/issue`,
            // eslint-disable-next-line @typescript-eslint/camelcase
            author_name: 'test_user',
            // eslint-disable-next-line @typescript-eslint/camelcase
            author_link: 'example.com/profile',
            // eslint-disable-next-line @typescript-eslint/camelcase
            author_icon: 'example.com/avatar',
            title: issue.title,
            // eslint-disable-next-line @typescript-eslint/camelcase
            title_link: issue.html_url,
            fields: [],
        });
    });
    it('should create an attachment with feedback date field', () => {
        const issue = {
            title: 'Testtitle',
            // eslint-disable-next-line @typescript-eslint/camelcase
            html_url: 'example.com/issue',
            user: {
                // eslint-disable-next-line @typescript-eslint/camelcase
                avatar_url: 'example.com/avatar',
                // eslint-disable-next-line @typescript-eslint/camelcase
                html_url: 'example.com/profile',
                login: 'test_user',
            },
            body: 'some text with <!--fb_date_start-->11-01-2019<!--fb_date_end-->',
        };
        expect(create_rfc_attachment_from_issue_1.createRfcAttachmentFromIssue(issue)).toMatchObject({
            fallback: `Testtitle RFC by test_user: example.com/issue`,
            // eslint-disable-next-line @typescript-eslint/camelcase
            author_name: 'test_user',
            // eslint-disable-next-line @typescript-eslint/camelcase
            author_link: 'example.com/profile',
            // eslint-disable-next-line @typescript-eslint/camelcase
            author_icon: 'example.com/avatar',
            title: issue.title,
            // eslint-disable-next-line @typescript-eslint/camelcase
            title_link: issue.html_url,
            fields: [
                {
                    title: 'Feedback closing date',
                    value: '11-01-2019',
                    short: false,
                },
            ],
        });
    });
});
