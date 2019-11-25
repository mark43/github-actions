"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const to_array_1 = require("./utils/to-array");
const web_api_1 = require("@slack/web-api");
/**
 * Gets action input and parses it as json
 * @param param
 * @param options
 */
const getParsedInput = (param, options = {
    required: true,
}) => {
    const input = core.getInput(param, options);
    try {
        const parsedInput = JSON.parse(input);
        return parsedInput;
    }
    catch (e) {
        throw new Error(`Failed parsing input for ${param}: ${e.message}`);
    }
};
exports.run = async () => {
    try {
        const slackBotToken = core.getInput('slack-bot-token', { required: true });
        const defaultConversationId = core.getInput('default-conversation-id', {
            required: true,
        });
        const messages = to_array_1.toArray(getParsedInput('messages'));
        for (const message of messages) {
            if (!message.channel) {
                message.channel = defaultConversationId;
            }
        }
        console.log('Creating slack client');
        const slackClient = new web_api_1.WebClient(slackBotToken);
        console.log(`Sending ${messages.length} message(s)...`);
        // TODO serialize api calls?
        await Promise.all(messages.map(message => slackClient.chat.postMessage(message)));
    }
    catch (error) {
        if (error.data) {
            console.error('Slack error:', error.data.response_metadata);
        }
        core.setFailed(error.message);
    }
};
if (process.env.NODE_ENV !== 'test') {
    exports.run();
}
