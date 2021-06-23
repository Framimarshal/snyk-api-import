import * as debugLib from 'debug';
import * as bunyan from 'bunyan';

import { Target } from './../lib/types';
import { getLoggingPath } from './../lib';
import { FAILED_LOG_NAME } from './../common';

const debug = debugLib('snyk:import-projects-script');


export function logFailedImports(
  orgId: string,
  integrationId: string,
  targets: Target[],
  errorData: {
    errorMessage: string;
    [name: string]: string;
  },
  loggingPath: string = getLoggingPath(),
  locationUrl?: string,
): void {
  const log = bunyan.createLogger({
    name: 'snyk:import-projects-script',
    level: 'error',
    streams: [{
      level: 'error',
      path: `${loggingPath}/${orgId}.${FAILED_LOG_NAME}`,
    }],
  });

  for(const target of targets) {
  
    try {
      debug({ integrationId, locationUrl, target, errorData: {...errorData} }, 'Failed to import target');
      log.error({ integrationId, locationUrl, target, errorData: {...errorData} }, 'Failed to import target');
    } catch (e) {
      log.error({ integrationId, locationUrl, target, errorData: {...errorData} }, 'Failed to log failed imports at location');
      debug('Failed to log failed imports at location: ', loggingPath);
      // do nothing
    }
  }
}
