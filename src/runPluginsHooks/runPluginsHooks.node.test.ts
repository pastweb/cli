import { noop } from '@pastweb/tools';
import { runPluginsHooks } from './runPluginsHooks';
import { defineHooks } from '../defineHooks';
import { loadPlugins } from '../loadPlugins';
import { getCommandInput } from '../getCommandInput';
import { HOOK_TYPE } from '../constants';
import { Plugin, Commands } from '../types';

type MyPlugin = Plugin & {
  first: (...args: any[]) => void;
  second?: (...args: any[]) => void;
  third?: (...args: any[]) => any;
};

const waterfallCB = jest.fn();
const parallelCB = jest.fn();
const finalCB = jest.fn();

const hooks = defineHooks({
  first: { args: () => 'firstArg' },
  second: { type: HOOK_TYPE.parallel, args: 'parallelArg', callback: parallelCB },
  third: {
    type: HOOK_TYPE.waterfall,
    args: 1,
    callback: waterfallCB,
    final: finalCB,
  },
});

const pluginCommands: Commands = {
  build: {
    command: noop,
  }
};

const commandFn = jest.fn((commandInput) => pluginCommands);

function getPlugins() {
  const plugin1: MyPlugin = {
    name: 'plugin1',
    commands: commandFn,
    enforce: 'pre',
    first: jest.fn(),
  };
  
  const plugin2: MyPlugin = {
    name: 'plugin2',
    commands: commandFn,
    first: jest.fn(),
    second: jest.fn(() => true),
  };
  
  const plugin3: MyPlugin = {
    name: 'plugin3',
    commands: commandFn,
    first: jest.fn(),
    second: jest.fn(() => true),
    third: jest.fn(arg => arg + 1)
  };
  
  const plugin4: MyPlugin = {
    name: 'plugin4',
    commands: commandFn,
    enforce: 'post',
    first: jest.fn(),
    second: jest.fn(() => true),
    third: jest.fn(arg => arg + 2)
  };
  
  return { plugin1, plugin2, plugin3, plugin4 };
}

const COMMAND = 'build --config=./config.js website --static';
const commandInput = getCommandInput(COMMAND.split(' '));

describe('runPluginsHooks', () => {
  describe('run all hooks functions.', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('the commands function should be not called.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(getPlugins()), commandInput);
      await runPluginsHooks(hooks, pluginsOrder);
      expect(commandFn).toBeCalledTimes(4);
    });

    it('the first hook function should be called with "firstArg".', async () => {
      const plugins = getPlugins();
      const { plugin1, plugin2, plugin3, plugin4 } = plugins;
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(plugins), commandInput);
      await runPluginsHooks(hooks, pluginsOrder);
      expect(plugin1.first).toHaveBeenCalledWith('firstArg');
      expect(plugin2.first).toHaveBeenCalledWith('firstArg');
      expect(plugin3.first).toHaveBeenCalledWith('firstArg');
      expect(plugin4.first).toHaveBeenCalledWith('firstArg');
    });

    it('the second hook function should be called with "parallelArg".', async () => {
      const plugins = getPlugins();
      const { plugin2, plugin3, plugin4 } = plugins;
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(plugins), commandInput);
      await runPluginsHooks(hooks, pluginsOrder);
      expect(plugin2.second).toHaveBeenCalledWith('parallelArg');
      expect(plugin3.second).toHaveBeenCalledWith('parallelArg');
      expect(plugin4.second).toHaveBeenCalledWith('parallelArg');
    });

    it('the second hook function should return true.', async () => {
      const plugins = getPlugins();
      const { plugin2, plugin3, plugin4 } = plugins;
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(plugins), commandInput);
      await runPluginsHooks(hooks, pluginsOrder);
      expect((plugin2.second as jest.Mock<any, any>).mock.results[0].value).toBe(true);
      expect((plugin3.second as jest.Mock<any, any>).mock.results[0].value).toBe(true);
      expect((plugin4.second as jest.Mock<any, any>).mock.results[0].value).toBe(true);
    });

    it('the parallelCB function should be called 3 times with true as argument.', async () => {
      const plugins = getPlugins();
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(plugins), commandInput);
      await runPluginsHooks(hooks, pluginsOrder);
      expect(parallelCB).toBeCalledTimes(3);
      expect(parallelCB).toHaveBeenCalledWith(true);
    });

    it('the waterfall hook function should be called once.', async () => {
      const plugins = getPlugins();
      const { plugin3, plugin4 } = plugins;
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(plugins), commandInput);
      await runPluginsHooks(hooks, pluginsOrder);
      expect(plugin3.third).toBeCalledTimes(1);
      expect(plugin4.third).toBeCalledTimes(1);
    });

    it('the waterfall hook function should has 1 as argument for plugin3.', async () => {
      const plugins = getPlugins();
      const { plugin3 } = plugins;
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(plugins), commandInput);
      await runPluginsHooks(hooks, pluginsOrder);
      expect(plugin3.third).toHaveBeenCalledWith(1);
    });

    it('the waterfall hook function should return 2 for plugin3.', async () => {
      const plugins = getPlugins();
      const { plugin3 } = plugins;
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(plugins), commandInput);
      await runPluginsHooks(hooks, pluginsOrder);
      expect((plugin3.third as jest.Mock<any, any>).mock.results[0].value).toBe(2);
    });

    it('the waterfall hook function should has 2 as argument for plugin4.', async () => {
      const plugins = getPlugins();
      const { plugin4 } = plugins;
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(plugins), commandInput);
      await runPluginsHooks(hooks, pluginsOrder);
      expect(plugin4.third).toHaveBeenCalledWith(2);
    });

    it('the waterfall hook function should return 4 for plugin4.', async () => {
      const plugins = getPlugins();
      const { plugin4 } = plugins;
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(plugins), commandInput);
      await runPluginsHooks(hooks, pluginsOrder);
      expect((plugin4.third as jest.Mock<any, any>).mock.results[0].value).toBe(4);
    });

    it('the waterfall final function should be called 2 times with 2 arguments.', async () => {
      const plugins = getPlugins();
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(plugins), commandInput);
      await runPluginsHooks(hooks, pluginsOrder);
      expect(finalCB).toBeCalledTimes(2);
      expect(finalCB).toHaveBeenCalledWith('default', 2);
      expect(finalCB).toHaveBeenCalledWith('post', 4);
    });
  });

  describe('run with excluded hook functions', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should run just the first hook functions.', async () => {
      const plugins = getPlugins();
      const { plugin1, plugin2, plugin3, plugin4 } = plugins;
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(plugins), commandInput);
      await runPluginsHooks(hooks, pluginsOrder, 'first');
      expect(commandFn).toBeCalledTimes(4);

      expect(plugin1.first).toBeCalledTimes(1);
      expect(plugin2.first).toBeCalledTimes(1);
      expect(plugin3.first).toBeCalledTimes(1);
      expect(plugin4.first).toBeCalledTimes(1);
      
      expect(plugin2.second).toBeCalledTimes(0);
      expect(plugin3.second).toBeCalledTimes(0);
      expect(plugin4.second).toBeCalledTimes(0);

      expect(plugin3.third).toBeCalledTimes(0);
      expect(plugin4.third).toBeCalledTimes(0);
    });

    it('should run just the first and second hook functions.', async () => {
      const plugins = getPlugins();
      const { plugin1, plugin2, plugin3, plugin4 } = plugins;
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(plugins), commandInput);
      await runPluginsHooks(hooks, pluginsOrder, ['first', 'second']);
      expect(commandFn).toBeCalledTimes(4);

      expect(plugin1.first).toBeCalledTimes(1);
      expect(plugin2.first).toBeCalledTimes(1);
      expect(plugin3.first).toBeCalledTimes(1);
      expect(plugin4.first).toBeCalledTimes(1);
      
      expect(plugin2.second).toBeCalledTimes(1);
      expect(plugin3.second).toBeCalledTimes(1);
      expect(plugin4.second).toBeCalledTimes(1);

      expect(plugin3.third).toBeCalledTimes(0);
      expect(plugin4.third).toBeCalledTimes(0);
    });

    it('should run just the first and third hook functions.', async () => {
      const plugins = getPlugins();
      const { plugin1, plugin2, plugin3, plugin4 } = plugins;
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(plugins), commandInput);
      await runPluginsHooks(hooks, pluginsOrder, ['first', 'third']);
      expect(commandFn).toBeCalledTimes(4);
      
      expect(plugin1.first).toBeCalledTimes(1);
      expect(plugin2.first).toBeCalledTimes(1);
      expect(plugin3.first).toBeCalledTimes(1);
      expect(plugin4.first).toBeCalledTimes(1);
      
      expect(plugin2.second).toBeCalledTimes(0);
      expect(plugin3.second).toBeCalledTimes(0);
      expect(plugin4.second).toBeCalledTimes(0);

      expect(plugin3.third).toBeCalledTimes(1);
      expect(plugin4.third).toBeCalledTimes(1);
    });

    it('should run just the second hook functions.', async () => {
      const plugins = getPlugins();
      const { plugin1, plugin2, plugin3, plugin4 } = plugins;
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(plugins), commandInput);
      await runPluginsHooks(hooks, pluginsOrder, 'second');
      expect(commandFn).toBeCalledTimes(4);
      
      expect(plugin1.first).toBeCalledTimes(0);
      expect(plugin2.first).toBeCalledTimes(0);
      expect(plugin3.first).toBeCalledTimes(0);
      expect(plugin4.first).toBeCalledTimes(0);
      
      expect(plugin2.second).toBeCalledTimes(1);
      expect(plugin3.second).toBeCalledTimes(1);
      expect(plugin4.second).toBeCalledTimes(1);

      expect(plugin3.third).toBeCalledTimes(0);
      expect(plugin4.third).toBeCalledTimes(0);
    });

    it('should run just the second and third hook functions.', async () => {
      const plugins = getPlugins();
      const { plugin1, plugin2, plugin3, plugin4 } = plugins;
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(plugins), commandInput);
      await runPluginsHooks(hooks, pluginsOrder, ['second', 'third']);
      expect(commandFn).toBeCalledTimes(4);
      
      expect(plugin1.first).toBeCalledTimes(0);
      expect(plugin2.first).toBeCalledTimes(0);
      expect(plugin3.first).toBeCalledTimes(0);
      expect(plugin4.first).toBeCalledTimes(0);
      
      expect(plugin2.second).toBeCalledTimes(1);
      expect(plugin3.second).toBeCalledTimes(1);
      expect(plugin4.second).toBeCalledTimes(1);

      expect(plugin3.third).toBeCalledTimes(1);
      expect(plugin4.third).toBeCalledTimes(1);
    });

    it('should run just the third hook functions.', async () => {
      const plugins = getPlugins();
      const { plugin1, plugin2, plugin3, plugin4 } = plugins;
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(plugins), commandInput);
      await runPluginsHooks(hooks, pluginsOrder, 'third');
      expect(commandFn).toBeCalledTimes(4);
      
      expect(plugin1.first).toBeCalledTimes(0);
      expect(plugin2.first).toBeCalledTimes(0);
      expect(plugin3.first).toBeCalledTimes(0);
      expect(plugin4.first).toBeCalledTimes(0);
      
      expect(plugin2.second).toBeCalledTimes(0);
      expect(plugin3.second).toBeCalledTimes(0);
      expect(plugin4.second).toBeCalledTimes(0);

      expect(plugin3.third).toBeCalledTimes(1);
      expect(plugin4.third).toBeCalledTimes(1);
    });
  });

  describe('run with skipped plugin order', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should not run just the plugin1 hooks functions.', async () => {
      const plugins = getPlugins();
      const { plugin1, plugin2, plugin3, plugin4 } = plugins;
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(plugins), commandInput);
      await runPluginsHooks(hooks, pluginsOrder, null, 'pre');
      expect(commandFn).toBeCalledTimes(4);

      expect(plugin1.first).toBeCalledTimes(0);
      expect(plugin2.first).toBeCalledTimes(1);
      expect(plugin3.first).toBeCalledTimes(1);
      expect(plugin4.first).toBeCalledTimes(1);
      
      expect(plugin2.second).toBeCalledTimes(1);
      expect(plugin3.second).toBeCalledTimes(1);
      expect(plugin4.second).toBeCalledTimes(1);

      expect(plugin3.third).toBeCalledTimes(1);
      expect(plugin4.third).toBeCalledTimes(1);
    });

    it('should not run just the plugin2 and plugin3 hooks functions.', async () => {
      const plugins = getPlugins();
      const { plugin1, plugin2, plugin3, plugin4 } = plugins;
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(plugins), commandInput);
      await runPluginsHooks(hooks, pluginsOrder, null, 'default');
      expect(commandFn).toBeCalledTimes(4);

      expect(plugin1.first).toBeCalledTimes(1);
      expect(plugin2.first).toBeCalledTimes(0);
      expect(plugin3.first).toBeCalledTimes(0);
      expect(plugin4.first).toBeCalledTimes(1);
      
      expect(plugin2.second).toBeCalledTimes(0);
      expect(plugin3.second).toBeCalledTimes(0);
      expect(plugin4.second).toBeCalledTimes(1);

      expect(plugin3.third).toBeCalledTimes(0);
      expect(plugin4.third).toBeCalledTimes(1);
    });

    it('should run just the plugin1 hooks functions.', async () => {
      const plugins = getPlugins();
      const { plugin1, plugin2, plugin3, plugin4 } = plugins;
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(plugins), commandInput);
      await runPluginsHooks(hooks, pluginsOrder, null, ['default', 'post']);
      expect(commandFn).toBeCalledTimes(4);

      expect(plugin1.first).toBeCalledTimes(1);
      expect(plugin2.first).toBeCalledTimes(0);
      expect(plugin3.first).toBeCalledTimes(0);
      expect(plugin4.first).toBeCalledTimes(0);
      
      expect(plugin2.second).toBeCalledTimes(0);
      expect(plugin3.second).toBeCalledTimes(0);
      expect(plugin4.second).toBeCalledTimes(0);

      expect(plugin3.third).toBeCalledTimes(0);
      expect(plugin4.third).toBeCalledTimes(0);
    });

    it('should run just the plugin4 hooks functions.', async () => {
      const plugins = getPlugins();
      const { plugin1, plugin2, plugin3, plugin4 } = plugins;
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(plugins), commandInput);
      await runPluginsHooks(hooks, pluginsOrder, null, ['pre', 'default']);
      expect(commandFn).toBeCalledTimes(4);

      expect(plugin1.first).toBeCalledTimes(0);
      expect(plugin2.first).toBeCalledTimes(0);
      expect(plugin3.first).toBeCalledTimes(0);
      expect(plugin4.first).toBeCalledTimes(1);
      
      expect(plugin2.second).toBeCalledTimes(0);
      expect(plugin3.second).toBeCalledTimes(0);
      expect(plugin4.second).toBeCalledTimes(1);

      expect(plugin3.third).toBeCalledTimes(0);
      expect(plugin4.third).toBeCalledTimes(1);
    });

    it('should run just the plugin2 and plugin3 hooks functions.', async () => {
      const plugins = getPlugins();
      const { plugin1, plugin2, plugin3, plugin4 } = plugins;
      const { pluginsOrder } = await loadPlugins(hooks, Object.values(plugins), commandInput);
      await runPluginsHooks(hooks, pluginsOrder, null, ['pre', 'post']);
      expect(commandFn).toBeCalledTimes(4);

      expect(plugin1.first).toBeCalledTimes(0);
      expect(plugin2.first).toBeCalledTimes(1);
      expect(plugin3.first).toBeCalledTimes(1);
      expect(plugin4.first).toBeCalledTimes(0);
      
      expect(plugin2.second).toBeCalledTimes(1);
      expect(plugin3.second).toBeCalledTimes(1);
      expect(plugin4.second).toBeCalledTimes(0);

      expect(plugin3.third).toBeCalledTimes(1);
      expect(plugin4.third).toBeCalledTimes(0);
    });
  });
});
