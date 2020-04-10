import stdMocks from 'std-mocks';
import stripAnsi from 'strip-ansi';
import { back as nockBack } from 'nock';
import * as path from 'path';
import { run } from '../';

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
  return cleanCliOutput(stdMocks.flush().stdout);
}

nockBack.fixtures = path.join(__dirname, 'fixtures');

describe('create-help-issue-message', () => {
  it('creates a message when an issue is opened', () => {});

  it('creates a message when an issue is closed', () => {});

  it('creates a message when an issue comment is created', () => {});

  it('does nothing if the issue does not have "help" label', () => {});
});
