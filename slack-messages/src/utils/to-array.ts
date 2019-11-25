export const toArray = <T>(data: T | T[]): T[] =>
  Array.isArray(data) ? data : [data];
