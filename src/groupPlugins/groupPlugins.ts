import { applyPlugin } from '../applyPlugin';
import { PluginGroups, Plugin, CommandsInput } from '../types';

export function groupPlugins<T extends Plugin = Plugin>(plugins: T[], commandsInput: CommandsInput = {}): PluginGroups<T> {
  const groups: Record<string, any[]> = {
    pre: [],
    default: [],
    post: [],
  };

  plugins.forEach(plugin => {
    const { apply, enforce = 'default' } = plugin;
    
    if (applyPlugin(apply, commandsInput)) {
      groups[enforce].push(plugin);
    }
  });

  return groups as unknown as PluginGroups<T>;
}
