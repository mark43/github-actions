import * as path from 'path';
import { back as nockBack } from 'nock';
import {
  beforeEachHook,
  afterEachHook,
  getCleanedMockStdout,
  setEnvVariables,
} from './util';

nockBack.fixtures = path.join(__dirname, 'fixtures');

describe('create-help-message', () => {
  beforeEach(beforeEachHook);
  afterEach(afterEachHook);

  it('creates a message when an issue is opened', async () => {
    const { nockDone } = await nockBack('helpIssue.json');
    setEnvVariables({
      eventName: 'issues',
      action: 'opened',
      isHelpIssue: true,
    });
    const { run } = await import('../');
    await run();
    nockDone();
    const output = getCleanedMockStdout();
    console.log(output);
    expect(output).toContain(
      '::set-output name=issue_message_json,::{"text":"https://github.com/mark43/README/issues/182 opened"}',
    );
  });
});
