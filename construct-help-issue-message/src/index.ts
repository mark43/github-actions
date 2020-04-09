import * as core from '@actions/core';
import { GitHub, context } from '@actions/github';

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

export async function run(): Promise<void> {
    // init GitHub client
    const repoToken = getParsedInput<string>('repo-token');
    // const github = new GitHub(repoToken);

    const message = { text: context.payload.issue?.html_url };

    if (context.eventName === 'issue') {
        // find out if issue has label 'help'
        // construct message
        core.setOutput('issue_message_json', JSON.stringify(message));
    }
}

if (process.env.NODE_ENV !== 'test') {
    run();
}
