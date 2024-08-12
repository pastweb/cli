import { applyPlugin } from '../applyPlugin';
import { normalizeArgs } from '../normalizeArgs';
import { printWarning } from '../printWarning';
import { Plugin, CommandsInput, HookFunction, Commands, PluginsOrder, PluginHooks, Hooks, Args } from '../types';

const exclude = new Set(['name', 'apply', 'commands', 'enforce']);

export async function loadPlugins<T extends Plugin>(
  hooks: Hooks,
  plugins: (T | T[])[],
  commandsInput: CommandsInput = {},
  includePluginCommands: string | string[] = []
): Promise<{
  commands: Commands;
  pluginsOrder: PluginsOrder;
}> {
  const include = new Set<string>(Array.isArray(includePluginCommands) ? includePluginCommands : [ includePluginCommands as string ]);
  let commands: Commands = {};
  let { args = [], ...pluginsArgs } = hooks['commands'] || {};
  
  args = await normalizeArgs(args);
  pluginsArgs = pluginsArgs || {} as Record<string, Args>;

  const pluginsOrder: Record<string, PluginHooks> = {
    pre: {},
    default: {},
    post: {},
  };

  for await (const plugin of plugins.flat()) {
    const { name, apply, enforce } = plugin;
    if (plugin.commands && (!include.size || include.has(name))) {
      const pluginArgs = pluginsArgs[name] ? [...args, ...await normalizeArgs(pluginsArgs[name])] : args;
      commands = Object.entries(plugin.commands(commandsInput, ...pluginArgs as any[]))
        .reduce((acc, [commandName, command]) => {
        if (acc[commandName]) {
          printWarning(`The command "${commandName}" is already registered.\nWill be available as "${name}:${commandName}"`);
  
          return { ...acc, [`${name}:${commandName}`]: command };
        }
  
        return { ...acc, [commandName]: command };
      }, commands);
    }
    if (applyPlugin(apply, commandsInput)) {
      const position = !enforce ? 'default' : enforce;

      Object.entries(plugin).forEach(([hook, val]: [string, string | string[] | HookFunction | Commands]) => {
        if (!exclude.has(hook)) {
          if (!pluginsOrder[position][hook]) pluginsOrder[position][hook] = { [name]: val as HookFunction };
          else pluginsOrder[position][hook][name] = val as HookFunction;
        }
      });
    }
  }

  return { commands, pluginsOrder: pluginsOrder as unknown as PluginsOrder };
}
