import Octokit from '@octokit/rest';
import { MessageAttachment } from '@slack/types';
import format from 'date-fns/format';

import { MessageAttachmentField } from '../types';
import { getFeedbackClosingDate } from './get-feedback-closing-date';

/**
 * Creates a RFC slack attachment from a Github issue response
 * @param issue
 */
export const createRfcAttachmentFromIssue = (
  issue: Octokit.IssuesGetResponse,
): MessageAttachment => {
  const feedbackClosingDate = getFeedbackClosingDate(issue.body);
  // TODO allow for more custom meta data via tags in description
  const fields: MessageAttachmentField[] = [
    feedbackClosingDate &&
      ({
        title: 'Feedback closing date',
        value: format(feedbackClosingDate, 'MM-dd-yyyy'),
        short: false,
      } as MessageAttachmentField),
  ].filter(
    (x: MessageAttachmentField | undefined): x is MessageAttachmentField => !!x,
  );
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
