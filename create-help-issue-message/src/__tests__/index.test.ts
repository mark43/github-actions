import stdMocks from 'std-mocks';
import stripAnsi from 'strip-ansi';
import { back as nockBack } from 'nock';
import * as path from 'path';

function cleanCliOutput(output: string[]): string {
  return output
    .reduce((a, b) => {
      return a.concat(stripAnsi(b).split('\n'));
    }, [] as string[])
    .filter((str) => str && !str.includes('console.log'))
    .map((str) => str.trim())
    .join('\n');
}

function getCleanedMockStdout(): string {
  const output = cleanCliOutput(stdMocks.flush().stdout);
  console.log(output);
  return output;
}

nockBack.fixtures = path.join(__dirname, 'fixtures');

function setEnvVariables({
  eventName,
  action,
}: {
  eventName: string;
  action: string;
}): void {
  process.env['GITHUB_EVENT_NAME'] = eventName;
  process.env['GITHUB_ACTION'] = action;
  process.env['GITHUB_EVENT_PATH'] = path.join(
    __dirname,
    'fixtures',
    eventName === 'issues' ? 'issuePayload.json' : 'issueCommentPayload.json',
  );
  process.env['INPUT_REPO-TOKEN'] = '"FAKE_TOKEN"';
  process.env['GITHUB_REPOSITORY'] = 'mark43/README';
  console.log(process.env.GITHUB_EVENT_PATH);
  console.log(process.env.GITHUB_EVENT_NAME);
}

describe('create-help-issue-message', () => {
  beforeEach(() => stdMocks.use());
  afterEach(() => {
    const { stderr, stdout } = stdMocks.flush();
    stdMocks.restore();
    // output captured data left in stdout and stderr
    const cleanedStderr = cleanCliOutput(stderr);
    if (cleanedStderr) {
      console.log(cleanedStderr);
    }
    const cleanedStdout = cleanCliOutput(stdout);
    if (cleanedStdout) {
      console.log(cleanedStdout);
    }
  });

  it.only('creates a message when an issue is opened', async () => {
    const { nockDone } = await nockBack('helpIssue.json');
    setEnvVariables({ eventName: 'issues', action: 'opened' });
    const { run } = await import('../');
    await run();
    nockDone();
    const output = getCleanedMockStdout();
    expect(output).toContain('::set-output name=issue_message_json,::[3,2,1]');
  });

  it('creates a message when an issue is closed', async () => {
    const { nockDone } = await nockBack('helpIssue.json');
    setEnvVariables({ eventName: 'issues', action: 'closed' });
    const { run } = await import('../');
    await run();
    nockDone();
    const output = getCleanedMockStdout();
    expect(output).toContain('::set-output name=issue_message_json,::[3,2,1]');
  });

  it('creates a message when an issue comment is created', async () => {
    const { nockDone } = await nockBack('helpIssue.json');
    setEnvVariables({ eventName: 'issue_comment', action: 'created' });
    const { run } = await import('../');
    await run();
    nockDone();
    const output = getCleanedMockStdout();
    expect(output).toContain('::set-output name=issue_message_json,::[3,2,1]');
  });

  it('outputs an empty array if the issue does not have "help" label', async () => {
    const { nockDone } = await nockBack('nonHelpIssue.json');
    setEnvVariables({ eventName: 'issues', action: 'opened' });
    const { run } = await import('../');
    await run();
    nockDone();
    const output = getCleanedMockStdout();
    expect(output).toContain('::set-output name=issue_message_json,::[]');
  });
});
