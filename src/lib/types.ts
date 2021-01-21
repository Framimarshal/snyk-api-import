export interface ImportTarget {
  orgId: string;
  integrationId: string;
  target: Target;
  files?: FilePath[];
  exclusionGlobs?: string;
}

export enum SupportedIntegrationTypes {
  GITHUB = 'github',
  GHE = 'github-enterprise',
}

export enum Sources {
  GITHUB = 'github',
  GHE = 'github-enterprise',
}

interface ImportingUser {
  id: string;
  name: string;
  username: string;
  email: string;
}

export interface SnykProject {
  name: string;
  id: string;
  created: string;
  origin: string;
  type: string;
  readOnly: boolean;
  testFrequency: string;
  isMonitored: boolean;
  totalDependencies: number;
  issueCountsBySeverity: {
    low: number;
    high: number;
    medium: number;
  };
  remoteRepoUrl: string; // URL of the repo
  lastTestedDate: string;
  browseUrl: string;
  owner: string | null;
  importingUser: ImportingUser;
  tags: unknown[];
  attributes: {
    criticality: unknown[];
    lifecycle: unknown[];
    environment: unknown[];
  };
  branch: string | null;
}

export interface CreatedOrg {
  name: string;
  created?: string;
  integrations: {
    [name: string]: string;
  };
  orgId: string;
  groupId: string;
  origName: string; // name requested to be created
  sourceOrgId?: string;
}
export interface Target {
  name?: string; // Gitlab, GitHub, GH Enterprise, Bitbucket Cloud and Azure Repos, Bitbucket Server, Azure Container Registry, Elastic Container Registry, Artifactory Container Registry, Docker Hub
  appId?: string; // Heroku, CloudFoundry, Pivotal & IBM Cloud
  functionId?: string; // AWS Labmda
  slugId?: string; // Heroku
  projectKey?: string; // Bitbucket Server
  repoSlug?: string; // Bitbucket Server
  id?: number; // Gitlab
  owner?: string; // Gitlab, GitHub, GH Enterprise, Bitbucket Cloud and Azure Repos
  // if not set default branch will be picked
  branch?: string; // Gitlab, GitHub, GH Enterprise, Bitbucket Cloud and Azure Repos
}

export interface FilePath {
  path: string;
}

export interface CreateOrgData {
  groupId: string;
  name: string;
  sourceOrgId?: string;
}

export enum Status {
  PENDING = 'pending',
  FAILED = 'failed',
  COMPLETE = 'complete',
}

export interface Project {
  targetFile?: string;
  success: boolean;
  projectUrl: string;
  // TODO: would be nice to add?
  // projectId: string;
}

export interface Log {
  name: string;
  created: string;
  status: Status;
  projects: Project[];
}

export interface PollImportResponse {
  id: string;
  status: 'pending' | 'failed' | 'complete';
  created: string;
  logs: Log[];
}
