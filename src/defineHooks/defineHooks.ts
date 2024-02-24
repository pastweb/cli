import { noop } from '@pastweb/tools';
import { Hook, Hooks, HookType } from '../types';

export const exclude = new Set(['name', 'apply', 'enforce']);

export function defineHooks(hooks: Hooks): Hooks {
  return Object.entries(hooks).reduce((acc, [hookName, hookConf]) => {
    if (exclude.has(hookName)) {
      throw new Error(`Cli error - The "${hookName}" hook name is private, please choose a different hook name.`);
    }

    if (hookName === 'commands') return { ...acc, [hookName]: hookConf };

    const { type, args, callback = noop, final = noop } = hookConf;
    const hook: Hook = {
      type: hookName === 'commands' || !type ? HookType.sequential : type,
      args,
      callback,
      final,
    };

    return { ...acc, [hookName]: hook };
  }, {});
}
