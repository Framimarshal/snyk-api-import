import * as path from 'path';
import * as fs from 'fs';

import { ImportProjects } from '../../src/scripts/import-projects';
import { IMPORT_PROJECTS_FILE_NAME } from '../../src/common';
import { deleteTestProjects } from '../delete-test-projects';
import { Project } from '../../src/lib/types';
import { generateLogsPaths } from '../generate-log-file-names';
import { deleteLogs } from '../delete-logs';

const ORG_ID = 'f0125d9b-271a-4b50-ad23-80e12575a1bf';

describe('Import projects script', () => {
  const discoveredProjects: Project[] = [];
  let logs: string[];

  afterAll(async () => {
    await deleteTestProjects(ORG_ID, discoveredProjects);
    await deleteLogs(logs);
  });
  it('succeeds to import targets from file', async () => {
    const logFiles = generateLogsPaths(__dirname, ORG_ID);
    logs = Object.values(logFiles);

    const projects = await ImportProjects(
      path.resolve(__dirname + `/fixtures/${IMPORT_PROJECTS_FILE_NAME}`),
      __dirname,
    );
    expect(projects).not.toBe([]);
    expect(projects[0]).toMatchObject({
      projectUrl: expect.any(String),
      success: true,
      targetFile: expect.any(String),
    });
    const logFile = fs.readFileSync(logFiles.importLogPath, 'utf8');
    expect(logFile).toMatch('shallow-goof-policy');
    expect(logFile).toMatch('composer-with-vulns');
    expect(logFile).toMatch('ruby-with-versions:');
    discoveredProjects.push(...projects);
  }, 30000000);
});

describe('Import skips previously imported', () => {
  const OLD_ENV = process.env;
  afterEach(async () => {
    process.env = { ...OLD_ENV };
  }, 1000);
  it('succeeds to import targets from file', async () => {
    const logPath = path.resolve(__dirname + '/fixtures/with-import-log');
    const logFiles = generateLogsPaths(logPath, ORG_ID);

    const projects = await ImportProjects(
      path.resolve(
        __dirname + `/fixtures/with-import-log/${IMPORT_PROJECTS_FILE_NAME}`,
      )
    );
    expect(projects.length === 0).toBeTruthy();
    const logFile = fs.readFileSync(logFiles.importLogPath, 'utf8');
    expect(logFile).toMatchSnapshot();
  }, 30000000);
});

describe('Skips & logs issues', () => {
  const OLD_ENV = process.env;
  const discoveredProjects: Project[] = [];
  let logs: string[];

  afterEach(async () => {
    await deleteLogs(logs);
    process.env = { ...OLD_ENV };
  }, 1000);

  afterAll(async () => {
    await deleteTestProjects(ORG_ID, discoveredProjects);
  });
  it('Skips any badly formatted targets', async () => {
    const logRoot = __dirname + '/fixtures/invalid-target/';
    const logFiles = generateLogsPaths(logRoot, ORG_ID);
    logs = Object.values(logFiles);

    const projects = await ImportProjects(
      path.resolve(
        __dirname +
          '/fixtures/invalid-target/import-projects-invalid-target.json',
      ),
    );
    expect(projects.length === 0).toBeTruthy();
    let logFile = null;
    try {
      logFile = fs.readFileSync(logFiles.importLogPath, 'utf8');
    } catch (e) {
      expect(logFile).toBeNull();
    }
    const failedLog = fs.readFileSync(logFiles.failedImportLogPath, 'utf8');
    expect(failedLog).toMatch('shallow-goof-policy');
  }, 300);

  it('Logs failed when API errors', async () => {
    const logRoot = __dirname + '/fixtures/single-project/';
    const logFiles = generateLogsPaths(logRoot, ORG_ID);
    logs = Object.values(logFiles);

    process.env.SNYK_HOST = 'https://do-not-exist.com';
    const projects = await ImportProjects(
      path.resolve(
        __dirname + '/fixtures/single-project/import-projects-single.json',
      ),
    );
    let logFile = null;
    try {
      logFile = fs.readFileSync(logFiles.importLogPath, 'utf8');
    } catch (e) {
      expect(logFile).toBeNull();
    }
    expect(projects.length === 0).toBeTruthy();
    const failedLog = fs.readFileSync(logFiles.failedImportLogPath, 'utf8');
    expect(failedLog).toMatch('ruby-with-versions');
  }, 300);
  it('Logs failed projects', async () => {
    const logRoot = __dirname + '/fixtures/projects-with-errors/';
    const logFiles = generateLogsPaths(logRoot, ORG_ID);
    logs = Object.values(logFiles);
    const projects = await ImportProjects(
      path.resolve(
        __dirname + '/fixtures/projects-with-errors/import-projects.json',
      ),
    );
    const logFile = fs.readFileSync(logFiles.importLogPath, 'utf8');
    expect(logFile).not.toBeNull();
    const failedProjectsLog = fs.readFileSync(
      logFiles.failedProjectsLogPath,
      'utf-8',
    );
    expect(failedProjectsLog).not.toBeNull();
    expect(failedProjectsLog).toMatch(
      'ruby-app-cyclic-lockfile-master/Gemfile.lock',
    );

    let failedImportLog = null;
    try {
      failedImportLog = fs.readFileSync(logFiles.importLogPath, 'utf8');
    } catch (e) {
      expect(failedImportLog).toBeNull();
    }
    expect(projects.length >= 1).toBeTruthy();
    const importedJobIdsLog = fs.readFileSync(logFiles.importJobIdsLogsPath, 'utf8');
    expect(importedJobIdsLog).not.toBeNull();
    const importedProjectsLog = fs.readFileSync(logFiles.importedProjectsLogPath, 'utf8');
    expect(importedProjectsLog).not.toBeNull();
    discoveredProjects.push(...projects);
  }, 50000);
});

describe('Error handling', () => {
  it('shows correct error when input can not be loaded', async () => {
    expect(
      ImportProjects(`do-not-exist/${IMPORT_PROJECTS_FILE_NAME}`),
    ).rejects.toThrow('File can not be found at location');
  }, 300);
  it('shows correct error when input is invalid json', async () => {
    expect(
      ImportProjects(
        path.resolve(__dirname + '/fixtures/import-projects-invalid.json'),
      ),
    ).rejects.toThrow('Failed to parse targets from');
  }, 300);
});
