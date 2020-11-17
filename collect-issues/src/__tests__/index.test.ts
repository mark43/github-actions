import stdMocks from 'std-mocks';
import stripAnsi from 'strip-ansi';
import { back as nockBack } from 'nock';
import * as path from 'path';
import { run } from '../index';

// stdmocks approach for testing against stdout taken from
// https://github.com/johanneslumpe/versionguard/blob/master/src/cli/__tests__/index.ts
function cleanCliOutput(output: string[]): string {
  return output
    .reduce((a, b) => {
      return a.concat(stripAnsi(b).split('\n'));
    }, [] as string[])
    .filter(str => str && !str.includes('console.log'))
    .map(str => str.trim())
    .join('\n');
}

function getCleanedMockStdout(): string {
  return cleanCliOutput(stdMocks.flush().stdout);
}

nockBack.fixtures = path.join(__dirname, 'fixtures');
const DEFAULT_ENV_OUTPUT_VARIABLE = 'TESTING';

function setEnvVariables({
  titleFilters = '',
  labelFilters = '',
  envOutputVariable = DEFAULT_ENV_OUTPUT_VARIABLE,
}: {
  titleFilters?: string | string[];
  labelFilters?: string | string[];
  envOutputVariable?: string;
} = {}): void {
  process.env['INPUT_ENV-OUTPUT-VARIABLE'] = `"${envOutputVariable}"`;
  process.env['INPUT_TITLEFILTERS'] = JSON.stringify(titleFilters);
  process.env['INPUT_LABELFILTERS'] = JSON.stringify(labelFilters);
  process.env['INPUT_REPO-TOKEN'] = `"FAKE_TOKEN"`;
  process.env['GITHUB_REPOSITORY'] = 'mark43/github-actions';
}

describe('collect-issues', () => {
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

  it('should collect all issues for a given repo and output the result', async () => {
    const { nockDone } = await nockBack('issuesFixture.json');
    setEnvVariables();
    await run();
    nockDone();
    const output = getCleanedMockStdout();
    expect(output).toContain(
      `::set-env name=${DEFAULT_ENV_OUTPUT_VARIABLE}::[3,2,1]`,
    );
    expect(output).toContain('::set-output name=issue_numbers::[3,2,1]');
  });

  describe('filtering', () => {
    describe('labels', () => {
      it('should filter issues by string', async () => {
        const { nockDone } = await nockBack('issuesFixture.json');
        setEnvVariables({
          labelFilters: 'bug',
        });
        await run();
        nockDone();
        const output = getCleanedMockStdout();
        expect(output).toContain(
          `::set-env name=${DEFAULT_ENV_OUTPUT_VARIABLE}::[2,1]`,
        );
        expect(output).toContain('::set-output name=issue_numbers::[2,1]');
      });

      it('should filter issues by string array', async () => {
        const { nockDone } = await nockBack('issuesFixture.json');
        setEnvVariables({
          labelFilters: ['bug', 'invalid'],
        });
        await run();
        nockDone();
        const output = getCleanedMockStdout();
        expect(output).toContain(
          `::set-env name=${DEFAULT_ENV_OUTPUT_VARIABLE}::[3,2,1]`,
        );
        expect(output).toContain('::set-output name=issue_numbers::[3,2,1]');
      });

      it('should filter issues by regexp string', async () => {
        const { nockDone } = await nockBack('issuesFixture.json');
        setEnvVariables({
          labelFilters: ['b\\w{1}g', 'lid$'],
        });
        await run();
        nockDone();
        const output = getCleanedMockStdout();
        expect(output).toContain(
          `::set-env name=${DEFAULT_ENV_OUTPUT_VARIABLE}::[3,2,1]`,
        );
        expect(output).toContain('::set-output name=issue_numbers::[3,2,1]');
      });
    });
  });

  describe('title', () => {
    it('should filter issues by string', async () => {
      const { nockDone } = await nockBack('issuesFixture.json');
      setEnvVariables({
        titleFilters: 'testing',
      });
      await run();
      nockDone();
      const output = getCleanedMockStdout();
      expect(output).toContain(
        `::set-env name=${DEFAULT_ENV_OUTPUT_VARIABLE}::[2,1]`,
      );
      expect(output).toContain('::set-output name=issue_numbers::[2,1]');
    });

    it('should filter issues by string array', async () => {
      const { nockDone } = await nockBack('issuesFixture.json');
      setEnvVariables({
        titleFilters: ['testing', 'third'],
      });
      await run();
      nockDone();
      const output = getCleanedMockStdout();
      expect(output).toContain(
        `::set-env name=${DEFAULT_ENV_OUTPUT_VARIABLE}::[3,2,1]`,
      );
      expect(output).toContain('::set-output name=issue_numbers::[3,2,1]');
    });

    it('should filter issues by regexp string', async () => {
      const { nockDone } = await nockBack('issuesFixture.json');
      setEnvVariables({
        titleFilters: ['.*?rfc.*'],
      });
      await run();
      nockDone();
      const output = getCleanedMockStdout();
      expect(output).toContain(
        `::set-env name=${DEFAULT_ENV_OUTPUT_VARIABLE}::[1]`,
      );
      expect(output).toContain('::set-output name=issue_numbers::[1]');
    });
  });

  describe('title and label', () => {
    it('should be able to filter for title and labels', async () => {
      const { nockDone } = await nockBack('issuesFixture.json');
      setEnvVariables({
        // negative lookbehind
        titleFilters: '(?<!testing) issue',
        labelFilters: ['^bu.*', 'invalid'],
      });
      await run();
      nockDone();
      const output = getCleanedMockStdout();
      expect(output).toContain(
        `::set-env name=${DEFAULT_ENV_OUTPUT_VARIABLE}::[3]`,
      );
      expect(output).toContain('::set-output name=issue_numbers::[3]');
    });
  });
});
