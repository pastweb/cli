import { noop } from '@pastweb/tools';
import { getCommandInput } from '../getCommandInput';
import { loadPlugins } from './loadPlugins';
import { Plugin, Commands } from '../types';

type MyPlugin = Plugin & {
  first?: () => void;
  second?: () => void;
}

const pluginCommands: Commands = {
  build: {
    command: noop,
  }
};

const COMMAND = 'build --config=./config.js spa --maia';
const commandInput = getCommandInput(COMMAND.split(' '));

const commandFn1 = jest.fn((commandInput, arg1, arg2) => pluginCommands);
const commandFn2 = jest.fn((commandInput, arg1, arg2) => pluginCommands);
const commandFn3 = jest.fn((commandInput, arg1, arg2) => pluginCommands);

function getPlugins() {
  const plugin1: MyPlugin = {
    name: 'plugin1',
    enforce: 'pre',
    commands: commandFn1,
    first: noop,
  };
  
  const plugin2: MyPlugin = {
    name: 'plugin2',
    apply: 'build',
    commands: commandFn2,
    first: noop,
    second: noop,
  };
  
  const plugin3: MyPlugin = {
    name: 'plugin3',
    apply: 'build/spa',
    first: noop,
    second: noop,
  };
  
  const plugin4: MyPlugin = {
    name: 'plugin4',
    apply: 'build/website',
    commands: commandFn3,
    first: noop,
    second: noop,
  };
  
  const plugin5: MyPlugin = {
    name: 'plugin5',
    enforce: 'post',
    apply: ['build/spa', 'build/website'],
    first: noop,
    second: noop,
  };

  const plugin6: MyPlugin[] = [
    {
      name: 'plugin6-pre',
      enforce: 'pre',
      first: noop,
    },
    {
      name: 'plugin6-post',
      enforce: 'post',
      first: noop,
    }
  ];
  
  return [ plugin1, plugin2, plugin3, plugin4, plugin5, plugin6 ];
}

const hooks = {
  commands: {
    args: ['arg1', 'arg2'],
    plugin1: [ 'arg3', 'arg4' ],
    plugin2: () => [ 'arg5', 'arg6' ],
  },
};

describe('loadPlugins', () => {
  describe('pluginsOrder', () => {
    it('the first hook should be present in the pluginsHooks.pre.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(pluginsOrder.pre.first).toBeDefined();
    });
    
    it('the second hook should be not present in the pluginsHooks.pre.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(pluginsOrder.pre.second).not.toBeDefined();
    });

    it('the first hook should be present in the pluginsHooks.default.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(pluginsOrder.default.first).toBeDefined();
    });
    
    it('the second hook should be present in the pluginsHooks.pre.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(pluginsOrder.default.second).toBeDefined();
    });

    it('the first hook should be present in the pluginsHooks.post.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(pluginsOrder.post.first).toBeDefined();
    });
    
    it('the second hook should be present in the pluginsHooks.post.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(pluginsOrder.post.second).toBeDefined();
    });
  
    it('the pluginsOrder.pre.first hook should has the plugin1 function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(typeof pluginsOrder.pre.first.plugin1).toBe('function');
    });

    it('the pluginsOrder.pre.first hook should has the plugin6-pre function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(typeof pluginsOrder.pre.first['plugin6-pre']).toBe('function');
    });

    it('the pluginsOrder.default.first hook should has not the plugin1 function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(pluginsOrder.default.first.plugin1).not.toBeDefined();
    });

    it('the pluginsOrder.post.first hook should has not the plugin1 function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(pluginsOrder.post.first.plugin1).not.toBeDefined();
    });
  
    it('the pluginsOrder.pre.first hook should has not the plugin2 function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(pluginsOrder.pre.first.plugin2).not.toBeDefined();
    });

    it('the pluginsOrder.default.first hook should has the plugin2 function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(typeof pluginsOrder.default.first.plugin2).toBe('function');
    });

    it('the pluginsOrder.default.second hook should has the plugin2 function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(typeof pluginsOrder.default.second.plugin2).toBe('function');
    });

    it('the pluginsOrder.post.first hook should has the plugin6-post function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(pluginsOrder.post.first['plugin6-post']).toBeDefined();
    });

    it('the pluginsOrder.post.first hook should has not the plugin2 function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(pluginsOrder.post.first.plugin2).not.toBeDefined();
    });

    it('the pluginsOrder.post.second hook should has not the plugin2 function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(pluginsOrder.post.second.plugin2).not.toBeDefined();
    });

    it('the pluginsOrder.pre.first hook should has not the plugin3 function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(pluginsOrder.pre.first.plugin3).not.toBeDefined();
    });

    it('the pluginsOrder.default.first hook should has the plugin3 function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(typeof pluginsOrder.default.first.plugin3).toBe('function');
    });

    it('the pluginsOrder.default.second hook should has the plugin3 function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(typeof pluginsOrder.default.second.plugin3).toBe('function');
    });

    it('the pluginsOrder.post.first hook should has not the plugin3 function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(pluginsOrder.post.first.plugin3).not.toBeDefined();
    });

    it('the pluginsOrder.post.second hook should has not the plugin3 function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(pluginsOrder.post.second.plugin3).not.toBeDefined();
    });
  
    it('the first hook should has not the plugin4 function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(typeof pluginsOrder.pre.first.plugin4).toBe('undefined');
      expect(typeof pluginsOrder.default.first.plugin4).toBe('undefined');
      expect(typeof pluginsOrder.post.first.plugin4).toBe('undefined');
    });

    it('the second hook should has not the plugin4 function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(typeof pluginsOrder.default.second.plugin4).toBe('undefined');
      expect(typeof pluginsOrder.post.second.plugin4).toBe('undefined');
    });
  
    it('the pluginsOrder.pre.first hook should has not the plugin5 function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(pluginsOrder.pre.first.plugin5).not.toBeDefined();
    });

    it('the pluginsOrder.default.first hook should has not the plugin5 function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(pluginsOrder.default.first.plugin5).not.toBeDefined();
    });

    it('the pluginsOrder.default.second hook should has the plugin5 function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(pluginsOrder.default.second.plugin5).not.toBeDefined();
    });

    it('the pluginsOrder.post.first hook should has the plugin5 function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(typeof pluginsOrder.post.first.plugin5).toBe('function');
    });

    it('the pluginsOrder.post.second hook should has the plugin5 function.', async () => {
      const { pluginsOrder } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(typeof pluginsOrder.post.second.plugin5).toBe('function');
    });
  });

  describe('commands', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('the command should be registered as "build, plugin2:build, plugin4:build".', async () => {
      const { commands } = await loadPlugins(hooks, getPlugins(), commandInput);
      expect(commands.build).toBeDefined();
      expect(commands['plugin2:build']).toBeDefined();
      expect(commands['plugin4:build']).toBeDefined();
    })
  
    it('the commands function1 shuold be called once.', async () => {
      await loadPlugins(hooks, getPlugins(), commandInput);
      expect(commandFn1).toBeCalledTimes(1);
    });
  
    it('the commands function1 shuold be called with args: ["commandInput", "arg1", "arg2"].', async () => {
      await loadPlugins(hooks, getPlugins(), commandInput);
      expect(commandFn1.mock.calls).toContainEqual([commandInput, 'arg1', 'arg2', 'arg3', 'arg4']);
    });
  
    it('the commands function2 shuold be called once.', async () => {
      await loadPlugins(hooks, getPlugins(), commandInput);
      expect(commandFn2).toBeCalledTimes(1);
    });
  
    it('the commands function2 shuold be called with args: ["commandInput", "arg1", "arg2"].', async () => {
      await loadPlugins(hooks, getPlugins(), commandInput);
      expect(commandFn2.mock.calls).toContainEqual([commandInput, 'arg1', 'arg2', 'arg5', 'arg6']);
    });

    it('the commands function3 shuold be called once.', async () => {
      await loadPlugins(hooks, getPlugins(), commandInput);
      expect(commandFn3).toBeCalledTimes(1);
    });
  
    it('the commands function3 shuold be called with args: ["commandInput", "arg1", "arg2"].', async () => {
      await loadPlugins(hooks, getPlugins(), commandInput);
      expect(commandFn3.mock.calls).toContainEqual([commandInput, 'arg1', 'arg2']);
    });
  });
});