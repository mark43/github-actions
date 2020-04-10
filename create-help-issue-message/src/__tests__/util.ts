import * as path from 'path';
import stdMocks from 'std-mocks';
import stripAnsi from 'strip-ansi';

function cleanCliOutput(output: string[]): string {
  return output
    .reduce((a, b) => {
      return a.concat(stripAnsi(b).split('\n'));
    }, [] as string[])
    .filter((str) => str && !str.includes('console.log'))
    .map((str) => str.trim())
    .join('\n');
}

export function getCleanedMockStdout(): string {
  const output = cleanCliOutput(stdMocks.flush().stdout);
  return output;
}

export function beforeEachHook() {
  stdMocks.use();
}

export function afterEachHook() {
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
}

export function setEnvVariables({
  eventName,
  action,
  isHelpIssue,
}: {
  eventName: 'issues' | 'issue_comment';
  action: 'created' | 'opened' | 'closed';
  isHelpIssue: boolean;
}): void {
  process.env['GITHUB_EVENT_NAME'] = eventName;
  process.env['GITHUB_ACTION'] = action;
  process.env['INPUT_REPO-TOKEN'] = '"FAKE_TOKEN"';
  process.env['GITHUB_REPOSITORY'] = 'mark43/README';

  let payloadFile = '';
  if (eventName === 'issues') {
    if (isHelpIssue) {
      payloadFile = 'issue.json';
    } else {
      payloadFile = 'nonHelpIssue.json';
    }
  } else if (eventName === 'issue_comment') {
    if (isHelpIssue) {
      payloadFile = 'issueComment.json';
    } else {
      payloadFile = 'nonHelpIssueComment.json';
    }
  }

  process.env['GITHUB_EVENT_PATH'] = path.join(
    __dirname,
    'webhook-payloads',
    payloadFile,
  );
}
