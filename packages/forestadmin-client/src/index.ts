import ChartHandler from './charts/chart-handler';
import ForestAdminClient from './forest-admin-client-with-cache';
import ActionPermissionService from './permissions/action-permission';
import PermissionService from './permissions/permission-with-cache';
import RenderingPermissionService from './permissions/rendering-permission';
import UserPermissionService from './permissions/user-permission';
import { ForestAdminClientOptions, ForestAdminClientOptionsWithDefaults } from './types';
import ContextVariablesInstantiator from './utils/context-variables-instantiator';

export { default as JTWTokenExpiredError } from './permissions/errors/jwt-token-expired-error';
export { default as JTWUnableToVerifyError } from './permissions/errors/jwt-unable-to-verify-error';
export { default as ChainedSQLQueryError } from './permissions/errors/chained-sql-query-error';
export { default as EmptySQLQueryError } from './permissions/errors/empty-sql-query-error';
export { default as NonSelectSQLQueryError } from './permissions/errors/non-select-sql-query-error';
export {
  ForestAdminClientOptions,
  Logger,
  LoggerLevel,
  ForestAdminClient,
  ChartHandlerInterface,
  ContextVariablesInstantiatorInterface,
} from './types';
export { CollectionActionEvent } from './permissions/types';

export default function createForestAdminClient(
  options: ForestAdminClientOptions,
): ForestAdminClient {
  const optionsWithDefaults: ForestAdminClientOptionsWithDefaults = {
    forestServerUrl: 'https://api.forestadmin.com',
    permissionsCacheDurationInSeconds: 15 * 60,
    // eslint-disable-next-line no-console
    logger: (level, ...args) => console[level.toLowerCase()](...args),
    ...options,
  };

  const actionPermission = new ActionPermissionService(optionsWithDefaults);
  const userPermission = new UserPermissionService(optionsWithDefaults);
  const renderingPermission = new RenderingPermissionService(optionsWithDefaults, userPermission);
  const permissionService = new PermissionService(actionPermission, renderingPermission);
  const contextVariablesInstantiator = new ContextVariablesInstantiator(renderingPermission);
  const chartHandler = new ChartHandler(contextVariablesInstantiator);

  return new ForestAdminClient(
    optionsWithDefaults,
    permissionService,
    renderingPermission,
    contextVariablesInstantiator,
    chartHandler,
  );
}

export * from './charts/types';
export { default as ContextVariablesInjector } from './utils/context-variables-injector';
export { default as ContextVariables } from './utils/context-variables';
export { default as ChartHandler } from './charts/chart-handler';