# @pastweb/cli

Library for plugin style CLI creation.
Highly inspired to the vite plugin system.

## Installation

```sh
$ npm i -S @pastweb/cli
```

## Usage
---
```js
import { argv } from 'node:process'; // node or bun
import { getCommandInput, defineHooks, loadPlugins, runCommand, runPluginsHooks } from '@pastweb/cli';

(async () => {
  const commandInput = getCommandInput(argv.slice(2));

  const hooks = defineHooks({
    // hooks configuration
  });
  
  const { commands, pluginHooks } = loadPlugins([
    // cli plugins
  ]);
  
  if (await runCommand(commands, commandInput)) {
    await runPluginsHooks(hooks, pluginHooks);
  }
})()
```

## Summary
---
- [overview](https://github.com/pastweb/cli.git#overview)
- [hooks](https://github.com/pastweb/cli.git#hooks)
- [plugins](https://github.com/pastweb/cli.git#plugins)
- [commands](https://github.com/pastweb/cli.git#commands)
- [functions](https://github.com/pastweb/cli.git#functions)

### Overview
---
The goal of the project is to give a tool mainly for cli definition, anyway there is no any dependecy to any specific platform, so the library could be used even just a plugin manager system, even in client side.
The main functions are used to define your own `cli` as the above example.
All the base functionlities must be defined in an async function.
In the example above is considerate the impementation in the index file or, anyway, in the main function program entry point.
The `cli` support the commands definition via plugin, you can find more information in [commands](https://github.com/pastweb/cli.git#commands) and [plugin](https://github.com/pastweb/cli.git#plugins) section.
After the [hooks](https://github.com/pastweb/cli.git#hooks) definition, the `loadPlugins` function normalize the [commands](https://github.com/pastweb/cli.git#commands) and the hooks defined in the plugins ready to run.
The `runCommand` function returns a boolean from the command function execution as some command could not need to run any plugin hook called from the `runPluginHooks` function.
If no any command definition want to be supported the just skip the `runCommand` function implementation as in the example below.
```js
import { defineHooks, loadPlugins, runPluginsHooks } from '@pastweb/cli';

(async () => {
  const hooks = defineHooks({
    // hooks configuration
  });
  
  const { commands, pluginHooks } = loadPlugins([
    // cli plugins
  ]);
  
  await runPluginsHooks(hooks, pluginHooks);
})()
```
### Hooks
---
For plugin hooks definition, you must define the `hooks` using the `defineHooks` function passing an Object as paramenter with the hook name as `key` and an hook definition Object as `value`. The hooks functions are executed in the same order definition.
Below the table of the hooks types:

| type         | async        | definition
| ------------ | ------------ | ------------ |
| `sequential` | sync / async | each hook function is executed sequentially and gets as arguments the values defined in the `args` hook definition property if any.
| `parallel`   | async        |each hook function is executed in parallel and gets as arguments the values defined in the `args` hook definition property if any.
| `waterfall`  | sync / async |each hook function is executed sequentially and gets as arguments the returned value from the previous hook function. The first hook function will gets as argument the value defined in the `args` hook definition property if any.

The hook definition Object is a javascript object with the following properties:
|name|type|definition|optional|default
|---|---|---|---|---|
type| string | `sequencial`/`parallel`/`waterfal` | no | `sequencial` |
args | any[] | Array of arguments passed to the hook function | yes | []|
callback | function | hook callback function called after the hook function call and get as argument the value returned from the hook function | yes | (...args: any[]) => void|
final | function | final callback function called after the hooks function call iteration and get as argument the hook order and the `args` present in the hook definition, if any, for `sequential` and 'parallel' hooks, or the result for the `waterfall` hooks. | yes | (order: string, ...args: any[] or result: any) => void|

example:

```js
import { defineHooks } from '@pastweb/cli';
import config, { normalizeConfig } from 'config'; // this is just as example

let normalizedConfig = config;

const hooks = defineHooks({
    firstHookName: {
    type: 'sequential',
  },
  secondHookName: {
    type: 'parallel',
    args: [ config ],
    callback: (config) => console.log(config),
  },
  thirdHookName: {
    type: 'waterfall',
    args: () => config,
    final (finalConfig) => {
        normalizedConfig = normalizeConfig(finalConfig);
    },
  }
});
```
##### Hook function
The hook functions are grouped from the `loadPlugins` function in 3 order groups `pre`, `default` and `post` before to be executed from the `runPluginHooks` function. You can find more information about how to enforce the plugin order in the [plugin](https://github.com/pastweb/cli.git#plugins) section.
##### Hook name
The hook name is an arbitrary name you can set in the hooks definition and it will be used later from the cli user in the `Plugin` definition. There are private names you cannot use as hook function name which are: `name`, `apply`, `enforce` and `commands`. You can find more info about these special names in the following [plugin](https://github.com/pastweb/cli.git#plugins) section.
You can use the `commands` name, into the hooks definition Object to pass arguments to che command function when the `loadPlugins` function is executed via the `args` property.
If you mant to pass additional arguments just to a specific plugin commands function, you can define the additional args using the plugin name as `key` in the commands definition Object as in the example below.
```js
const hooks = defineHooks({
    commands: {
        args: 'arg1',
        plugin1: ['arg2', 'arg3'],
        plugin2: () => ['arg4', 'arg5'],
    },
    // other hooks definition
});
```
In the axample above all the plugins `commandsHook` function will receive `commands(commandInput, 'arg1')`,
the `pligin1` `commands(commandInput, 'arg1', 'arg2', 'arg3')`,
the `pligin2` `commands(commandInput, 'arg1', 'arg4', 'arg5')`,
##### Hook args
The `args` property is used to pass arguments to the hook function and it can be a single value, an array of values or a function which returns one of the previous types.

Keep in mind:
* The array of values will be spreaded in the hook function call as separated arguments.
* The args function will be executed just before the hook function call.
* For `waterfall` hooks you can pass just a single argument or a function which returns a single argument. If you pass an array, just the first value will be passed as argument.

##### Hook callback
The callback function is called after the hook function and gets as argument the value retured from the hook function if any.
##### Hook final
The final function will be executed after the hook functions call iteration and gets as first argument the plugin order: `pre` or `default` or `post`, and the arguments defined in the `args` hook definition property for `sequential` and `parallel` hooks or the returned value from the last hook function (if any) from `waterfall` hooks.

### Plugins
---
The Plugin is an Object where the 'key' is a string according to the `hooks` definition and the value is the hook function.
The Object must have a `name` portety for the pligin name, and can contains an `apply` and `enforce` properties too.

|name|type|definition|optional|default
|---|---|---|---|---|
name| string | the plugin name | no | undefined |
apply| string \| string[] \| ((commadsInput: CommandsInput) => boolean) | the command/commands name where apply the plugin hooks | yes | undefined |
enforce | string | `pre` or `post` to mark the plugin order | yes | undefined |
commands | function | (commandsInput: CommandsInput, ...args: any[]) => Commands | yes | undefined |

The `apply` property is used to apply a plugin to a specific command. It accept a string or a string array with the commands names `/` separated for a more specific command selection.
As example: `build/website`
In this apply definition `website` is a section of the `build` command.
If an array of commands is provided the plugin will be applied if any of the commands definition will match the `cli` input command.
If a function is provided, the function will receive the `commandInput` object and expect a `boolean` to be returned for apply or not the plugin hooks.

The `enforce` property allow to mark the order of when the hooks should be called.
The `loadPlugins` function will group by `hookName` for `pre`, `post` or `default` (if the `enforce` property is `undefined`) and it can handle even a `multi-stage` plugin, which is pretty much an array of plugins with different order.
The `commands` hook is a special hook used to register new commands in order to be available before the cli command execution and will gets as arguments the `commandInput` object (previously generated from the `getCommandInput` function) and the values defined in the `commands` hooks `args` definition if any. The commands registration is applyed by the `loadPlugins` function and is indipendent from the `enforce` property, if the command name is already registered, the cli will print a warning and the command will be registered as `<pluginName>:<commandName>`.

```js
const plugin = {
    name: 'myPlugin',
    apply: 'commandName/sectionCommand',
    enfore: 'post',
    myHookName() {
        ...
    },
    // ...other hooks
};
```

### Commands
---
The commands are defined via the [command plugin hook](https://github.com/pastweb/cli.git#plugins), using a command definition Object with the following properties:
|name|type|optional|
|---|---|---|
command | CommandFunction | no |
help | Help | yes |

When the `cli` is called, the `getCommandInput` function get command line as string or a string array, generating a `commandInput` Object following the syntax as in the example below:

```sh
$ myCli command_1 --option1=val_1 -v=2 command_2 --option2=[ val2, 3 ] --opt3={ prop1: val }
```
The quotes single `'` or doubble `"` are optional che the string values definition.
The above command line will generate the following `commandInput` Object:

```js
// commandInput
{
  command_1: {
    option1: 'val_1',
    v: 2
  },
  command_2: {
    opt3: { prop1: val },
    option2: ['val2', 3]
  }
}
```

The command options must start with `--` or `-` as shotrcut. If the value is not defined in the command line, the option will have `true` by default as value in the `commandInput` Object, or will get de value defined in the command line after the `=`, which could be a string ,a number or a boolean, or an array of values or an Object `key`:`vaule`. In case of the Obeject definition the `'` and `"` are not needed. Both, Object and array, definition are not nestable. If the first command has just options, in the `commandInput` Object the options will be available under the `none` key.
If the command is loaded via plugin and is already registered, the Cli will print a warning and the command will be available with the syntax `pluginName:command`.

#### Command Function
---
The `CommandFunction` is the function called to execure the command, reveice the `commandInput` Object as first argument, and any other `args` if defined in the `command hook` explained [below](https://github.com/pastweb/cli.git#hooks).
As the CLI is extendable and it could load a command definition which don't needs, or don't want, runs the plugins hooks, is possible prevent this default behaviour just returning `false` from the `CommandFunction` execution.

#### Help Object
---

The help Object in the command definition has the following properties:
|name|type|optional|
|---|---|---|
commandName | string | no |
description | string / string[] | no |
The command description could be a string or a string array for output formatting and can follow the syntax:

```js
`command` <param>
```

for text color.
For preventing the commands loading via plugin you must set the `preventCommandsLoading` class property to `true`.

### Functions
---
###### `getCommandInput(argv: string | string[] = []) => CommandsInput`
Gets as single paramenter a string, or an array of strings representing the the user command input and returns an object as described in the [commands](https://github.com/pastweb/cli.git#commands) section.
###### `defineHooks(hooks: Hooks): Hooks`
Check and normalize the hooks definition.
###### `loadPlugins<T extends Plugin = Plugin>(hooks: Hooks, plugins: T[], commandsInput: CommandsInput = {}, includePluginCommands: string | string[] = []): { commands: Commands; pluginsOrder: PluginsOrder; }`
Loads the plugins grouping the hooks by `order` and the commands in a single Object.
The `commands` arguments defined in the `commands` hook definition will be normalized when the loadPlugins function is called.
Check the [hooks](https://github.com/pastweb/cli.git#hooks) section fore more info.
The commands in any Plugin will be included if the `includePluginCommand` ( `string` or `string[]` ) parameter is not provided, or just the commands defined in the plugin with the corrispondant name in the parameter.
The `commandsInput` parameter is optional, just in case you want to use the library as pluginManager without any command option.
###### `runCommand(commands: Commands, commandsInput: CommandsInput): boolean | void`
Runs the command defined in the `commandInput` Object, it will pass the commandInput object to the `commandFunction` as first argument and the other `args` defined in the `commands` hook if any.
###### `async runPluginsHooks(hooks: Hooks, pluginOrder: PluginsOrder, includeHook: string  | string[] | null | undefined = [],skipOrder: string  | string[] | null | undefined = []): Promise<void>`
Runs the Pligins hooks grouped by order included the hook defined in the `includeHooks` paramenter, all of them otherwise, and skipping the orders defined in the `skipOrder` parameter.
###### `groupPlugins<T extends Plugin = Plugin>(plugins: T[], commandsInput: CommandsInput = {}): PluginGroups<T>`
It groups the plugins by order: `pre`, `default` or `post`,
