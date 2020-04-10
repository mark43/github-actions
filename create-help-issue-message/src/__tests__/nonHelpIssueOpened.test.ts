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

  it('outputs an empty array if the opened issue does not have "help" label', async () => {
    const { nockDone } = await nockBack('nonHelpIssue.json');
    setEnvVariables({
      eventName: 'issues',
      action: 'opened',
      isHelpIssue: false,
    });
    const { run } = await import('../');
    await run();
    nockDone();
    const output = getCleanedMockStdout();
    expect(output).toContain('::set-output name=issue_message_json,::[]');
  });
});
