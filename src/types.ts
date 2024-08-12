import type { HOOK_TYPE } from "./constants";

export type CliErrorMessage = string | Error | unknown | Record<string, any> | any[];

export type CliWarningMessage = string | Record<string, any> | any[];

export type CliInfoMessage = string | Record<string, any> | any[];

export type Plugin = {
  name: string;
  apply?: string | string[] | ((commadsInput: CommandsInput) => boolean);
  commands?: (commandsInput: CommandsInput, ...args: any[]) => Commands;
  enforce?: 'pre' | 'post';
};

export interface PluginsOrder {
  pre: PluginHooks;
  default: PluginHooks;
  post: PluginHooks;
};

export interface PluginGroups<T extends Plugin> {
  pre: T[];
  default: T[];
  post: T[];
};

export type PluginHooks = {
  [hook: string]: {
    [pluginName: string]: HookFunction;
  };
};

export type HookCallback = (...args: any[]) => void;

export type HookFunction = (...args: any[]) => any;

export type ArgsFunction = () => any | Promise<any>;

export type Args = any | any[] | ArgsFunction;

export type Hook = {
  type?: HOOK_TYPE;
  args?: Args;
  callback?: HookCallback;
  final?: (order: string, ...args: any[]) => void;
}

export type CommandsHook = {
  args?: Args;
  [pluginName: string]: Args;
};

export type Hooks = { [name: string]: Hook; } & { commands?: CommandsHook; };

export type CommandOptions = {
  [optionsName: string]: string | number | boolean | any[] | Record<string, string | number | boolean>;
};

export type CommandsInput = {
  [commandName: string]: CommandOptions;
};

export type CommandFunction = () => boolean | void | Promise<boolean | void>;

export type Command = {
  command: CommandFunction;
  help?: Help;
};

export type Commands = {
  [commandName: string]: Command;
};

export type Help = {
  commandName?: string;
  description?: string | string[];
};
