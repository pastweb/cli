import { noop } from '@pastweb/tools';
import { normalizeArgs } from '../normalizeArgs';
import { printError } from '../printError';
import { Hook, HookType, PluginsOrder, PluginHooks } from '../types';

export async function runHooks(
  hook: [string, Hook],
  pluginHooks: PluginHooks,
  include: Set<string>,
  order: string,
  wr: Map<string, any>,
): Promise<any> {
  const [ hookName, config ] = hook;
  
  if ((!include.size || include.has(hookName)) && pluginHooks[hookName]) {
    const { type, args: _args = [], callback = noop, final = noop } = config;
    const args = await normalizeArgs(_args);

    switch(type) {
      case HookType.sequential:
        await Object.entries(pluginHooks[hookName])
        .reduce((acc, [pluginName, fn]) => {
          try {
            acc.then(async () => await fn(...args))
            .then(async data => await callback(await data));
              
          } catch (e) {
            printError(e, null, `Plugin error from "${pluginName}" in "${hookName}".`);
          }
          return acc;
        }, Promise.resolve(args));
        
        await final(order, ...args);
      break;
      case HookType.parallel:
        await Promise.all(Object.entries(pluginHooks[hookName])
        .map(async ([pluginName, fn]) => {
          try {
            return callback(await fn(...args));
          } catch (e) {
            printError(e, null, `Plugin error from "${pluginName}" in "${hookName}".`);
          }

          return true;
        }));
        await final(order, ...args);
      break;
      case HookType.waterfall:
        const job = Object.entries(pluginHooks[hookName])
        .reduce((acc, [pluginName, fn]) => {
          try {
            const result = acc.then(fn);
            result.then(async data => await callback(await data));
            
            return result;
          } catch (e) {
            printError(e, null, `Plugin error from "${pluginName}" in "${hookName}".`);
            return acc;
          }
        }, Promise.resolve(wr.get(hookName) || args[0]));

        const result = await job;
        wr.set(hookName, result);

        await final(order, result);
      break;
    }
  }
}

export async function runPluginsHooks(
  hooks: { [name: string]: Hook },
  pluginOrder: PluginsOrder,
  includeHook: string  | string[] | null | undefined = [],
  skipOrder: string  | string[] | null | undefined = [],
): Promise<void> {
  const include = !includeHook ? new Set<string>() : Array.isArray(includeHook) ? new Set(includeHook) : new Set([ includeHook ]);
  const skip = !skipOrder ? new Set<string>() : Array.isArray(skipOrder) ? new Set(skipOrder) : new Set([ skipOrder ]);
  const waterfallResults = new Map<string, any>();

  await Object.entries(hooks).reduce(async (acc, [ hookName, config ]) => {
    return acc
    .then(async () => {
      if (!skip.has('pre')) {
        await runHooks([hookName, config], pluginOrder.pre, include, 'pre', waterfallResults);
      }  
    }).then(async () => {
      if (!skip.has('default')) {
        await runHooks([hookName, config], pluginOrder.default, include, 'default', waterfallResults);
      }
    }).then(async () => {
      if (!skip.has('post')) {
        await runHooks([hookName, config], pluginOrder.post, include, 'post', waterfallResults);
      }  
    });
  }, Promise.resolve());
}
