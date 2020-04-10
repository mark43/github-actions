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

  it('creates a message when an issue comment is created', async () => {
    const { nockDone } = await nockBack('helpIssue.json');
    setEnvVariables({
      eventName: 'issue_comment',
      action: 'created',
      isHelpIssue: true,
    });
    const { run } = await import('../');
    await run();
    nockDone();
    const output = getCleanedMockStdout();
    expect(output).toContain(
      '::set-output name=issue_message_json,::{"text":"https://github.com/mark43/README/issues/182#issuecomment-612120826"}',
    );
  });
});
