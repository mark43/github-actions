import { getValueForMarker } from './get-value-for-marker';
/**
 * Extracts a marked feedback closing date from a given string, e.g.:
 * `<!--fb_date_start-->11-20-2019<!--fb_date_end-->`
 * Expects a date in the format of MM-DD-YYYY
 * @param text
 */
export const getFeedbackClosingDate = (text: string): Date | undefined => {
  const feedbackDate = getValueForMarker('fb_date', text);
  // no date marker found
  if (!feedbackDate) {
    return undefined;
  }
  let dateStringMatch = feedbackDate.match(/(\d{2}-\d{2}-\d{4})/);
  let dateString = undefined;
  // provided string not a valid date string
  if (dateStringMatch) {
    dateString = dateStringMatch[1];
  } else {
    dateStringMatch = feedbackDate.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateStringMatch) {
      //if just YYYY-MM-DD converts GMT to Local and can shift date.
      dateString = `${dateStringMatch[1]}T00:00:00`;
    }
  }

  if (!dateString) {
    return undefined;
  }
  // TODO less naive date formatting
  const date = new Date(dateString);
  if (isNaN(date.getFullYear())) {
    return undefined;
  }
  date.setHours(0);
  date.setMilliseconds(0);
  date.setSeconds(0);
  date.setMinutes(0);
  return date;
};
