"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const std_mocks_1 = __importDefault(require("std-mocks"));
const strip_ansi_1 = __importDefault(require("strip-ansi"));
const nock_1 = require("nock");
const path = __importStar(require("path"));
const index_1 = require("../index");
// stdmocks approach for testing against stdout taken from
// https://github.com/johanneslumpe/versionguard/blob/master/src/cli/__tests__/index.ts
function cleanCliOutput(output) {
    return output
        .reduce((a, b) => {
        return a.concat(strip_ansi_1.default(b).split('\n'));
    }, [])
        .filter(str => str && !str.includes('console.log'))
        .map(str => str.trim())
        .join('\n');
}
function getCleanedMockStdout() {
    return cleanCliOutput(std_mocks_1.default.flush().stdout);
}
nock_1.back.fixtures = path.join(__dirname, 'fixtures');
const DEFAULT_ENV_OUTPUT_VARIABLE = 'TESTING';
function setEnvVariables({ titleFilters = '', labelFilters = '', envOutputVariable = DEFAULT_ENV_OUTPUT_VARIABLE, } = {}) {
    process.env['INPUT_ENV-OUTPUT-VARIABLE'] = `"${envOutputVariable}"`;
    process.env['INPUT_TITLEFILTERS'] = JSON.stringify(titleFilters);
    process.env['INPUT_LABELFILTERS'] = JSON.stringify(labelFilters);
    process.env['INPUT_REPO-TOKEN'] = `"FAKE_TOKEN"`;
    process.env['GITHUB_REPOSITORY'] = 'mark43/github-actions';
}
describe('collect-issues', () => {
    beforeEach(() => std_mocks_1.default.use());
    afterEach(() => {
        const { stderr, stdout } = std_mocks_1.default.flush();
        std_mocks_1.default.restore();
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
        const { nockDone } = await nock_1.back('issuesFixture.json');
        setEnvVariables();
        await index_1.run();
        nockDone();
        const output = getCleanedMockStdout();
        expect(output).toContain(`::set-env name=${DEFAULT_ENV_OUTPUT_VARIABLE},::[526754817,526754715,526216278]`);
        expect(output).toContain('::set-output name=issueids,::[526754817,526754715,526216278]');
    });
    describe('filtering', () => {
        describe('labels', () => {
            it('should filter issues by string', async () => {
                const { nockDone } = await nock_1.back('issuesFixture.json');
                setEnvVariables({
                    labelFilters: 'bug',
                });
                await index_1.run();
                nockDone();
                const output = getCleanedMockStdout();
                expect(output).toContain(`::set-env name=${DEFAULT_ENV_OUTPUT_VARIABLE},::[526754715,526216278]`);
                expect(output).toContain('::set-output name=issueids,::[526754715,526216278]');
            });
            it('should filter issues by string array', async () => {
                const { nockDone } = await nock_1.back('issuesFixture.json');
                setEnvVariables({
                    labelFilters: ['bug', 'invalid'],
                });
                await index_1.run();
                nockDone();
                const output = getCleanedMockStdout();
                expect(output).toContain(`::set-env name=${DEFAULT_ENV_OUTPUT_VARIABLE},::[526754817,526754715,526216278]`);
                expect(output).toContain('::set-output name=issueids,::[526754817,526754715,526216278]');
            });
            it('should filter issues by regexp string', async () => {
                const { nockDone } = await nock_1.back('issuesFixture.json');
                setEnvVariables({
                    labelFilters: ['b\\w{1}g', 'lid$'],
                });
                await index_1.run();
                nockDone();
                const output = getCleanedMockStdout();
                expect(output).toContain(`::set-env name=${DEFAULT_ENV_OUTPUT_VARIABLE},::[526754817,526754715,526216278]`);
                expect(output).toContain('::set-output name=issueids,::[526754817,526754715,526216278]');
            });
        });
    });
    describe('title', () => {
        it('should filter issues by string', async () => {
            const { nockDone } = await nock_1.back('issuesFixture.json');
            setEnvVariables({
                titleFilters: 'testing',
            });
            await index_1.run();
            nockDone();
            const output = getCleanedMockStdout();
            expect(output).toContain(`::set-env name=${DEFAULT_ENV_OUTPUT_VARIABLE},::[526754715,526216278]`);
            expect(output).toContain('::set-output name=issueids,::[526754715,526216278]');
        });
        it('should filter issues by string array', async () => {
            const { nockDone } = await nock_1.back('issuesFixture.json');
            setEnvVariables({
                titleFilters: ['testing', 'third'],
            });
            await index_1.run();
            nockDone();
            const output = getCleanedMockStdout();
            expect(output).toContain(`::set-env name=${DEFAULT_ENV_OUTPUT_VARIABLE},::[526754817,526754715,526216278]`);
            expect(output).toContain('::set-output name=issueids,::[526754817,526754715,526216278]');
        });
        it('should filter issues by regexp string', async () => {
            const { nockDone } = await nock_1.back('issuesFixture.json');
            setEnvVariables({
                titleFilters: ['.*?rfc.*'],
            });
            await index_1.run();
            nockDone();
            const output = getCleanedMockStdout();
            expect(output).toContain(`::set-env name=${DEFAULT_ENV_OUTPUT_VARIABLE},::[526216278]`);
            expect(output).toContain('::set-output name=issueids,::[526216278]');
        });
    });
    describe('title and label', () => {
        it('should be able to filter for title and labels', async () => {
            const { nockDone } = await nock_1.back('issuesFixture.json');
            setEnvVariables({
                // negative lookbehind
                titleFilters: '(?<!testing) issue',
                labelFilters: ['^bu.*', 'invalid'],
            });
            await index_1.run();
            nockDone();
            const output = getCleanedMockStdout();
            expect(output).toContain(`::set-env name=${DEFAULT_ENV_OUTPUT_VARIABLE},::[526754817]`);
            expect(output).toContain('::set-output name=issueids,::[526754817]');
        });
    });
});
