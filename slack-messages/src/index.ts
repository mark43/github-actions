import * as core from '@actions/core';
import { toArray } from './utils/to-array';

import { WebClient, ChatPostMessageArguments } from '@slack/web-api';

/**
 * Gets action input and parses it as json
 * @param param
 * @param options
 */
const getParsedInput = <T>(
  param: string,
  options: core.InputOptions = {
    required: true,
  },
): T => {
  const input = core.getInput(param, options);
  try {
    const parsedInput = JSON.parse(input);
    return parsedInput as T;
  } catch (e) {
    throw new Error(`Failed parsing input for ${param}: ${e.message}`);
  }
};

export const run = async (): Promise<void> => {
  try {
    const slackBotToken = core.getInput('slack-bot-token', { required: true });
    const defaultConversationId = core.getInput('default-conversation-id', {
      required: true,
    });

    const messages = toArray(
      getParsedInput<ChatPostMessageArguments | ChatPostMessageArguments[]>(
        'messages',
      ),
    );

    for (const message of messages) {
      if (!message.channel) {
        message.channel = defaultConversationId;
      }
    }

    console.log('Creating slack client');
    const slackClient = new WebClient(slackBotToken);

    console.log(`Sending ${messages.length} message(s)...`);
    // TODO serialize api calls?
    await Promise.all(
      messages.map(message => slackClient.chat.postMessage(message)),
    );
  } catch (error) {
    if (error.data) {
      console.error('Slack error:', error.data.response_metadata);
    }
    core.setFailed(error.message);
  }
};

if (process.env.NODE_ENV !== 'test') {
  run();
}
