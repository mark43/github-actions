import { getFeedbackClosingDate } from '../get-feedback-closing-date';

describe('get-feedback-closing-date', () => {
  it('should return a date value for `fb_date` marker', () => {
    const given = `some text with <!--fb_date_start-->11-01-2019<!--fb_date_end-->`;
    const date = getFeedbackClosingDate(given);

    expect(date).not.toBeFalsy();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(date!.getFullYear()).toBe(2019);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(date!.getDate()).toBe(1);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(date!.getMonth()).toBe(10);
  });
});
