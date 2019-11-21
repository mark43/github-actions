export const createRegexpFromStrings = (filters: string[]): RegExp =>
  new RegExp(filters.join('|'), 'i');
