import { MessageAttachment } from '@slack/types';

type UnwrapArray<T> = T extends (infer R)[] ? R : T;

export type MessageAttachmentField = Exclude<
  UnwrapArray<MessageAttachment['fields']>,
  undefined
>;
