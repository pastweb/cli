import { groupPlugins } from './groupPlugins';
import { Plugin } from '../types';

type MyPlugin = Plugin & {
  first: (...args: any[]) => void;
  second?: (...args: any[]) => void;
  third?: (...args: any[]) => any;
};

const plugin1: MyPlugin = {
  name: 'plugin1',
  enforce: 'pre',
  first: jest.fn(),
};

const plugin2: MyPlugin = {
  name: 'plugin2',
  first: jest.fn(),
  second: jest.fn(() => true),
};

const plugin3: MyPlugin = {
  name: 'plugin3',
  first: jest.fn(),
  second: jest.fn(() => true),
  third: jest.fn(arg => arg + 1)
};

const plugin4: MyPlugin = {
  name: 'plugin4',
  enforce: 'post',
  first: jest.fn(),
  second: jest.fn(() => true),
  third: jest.fn(arg => arg + 2)
};

const plugins = [plugin1, plugin2, plugin3, plugin4];

const groups = groupPlugins<MyPlugin>(plugins);

describe('groupPlugins', () => {
  it('the plugin1 should be in the "pre" group.', () => {
    const exists = groups.pre.find(plugin => plugin.name === 'plugin1');
    expect(exists).toBeDefined();
  });

  it('the plugin1 should not be in the "default" group.', () => {
    const exists = groups.default.find(plugin => plugin.name === 'plugin1');
    expect(exists).not.toBeDefined();
  });

  it('the plugin1 should not be in the "post" group.', () => {
    const exists = groups.post.find(plugin => plugin.name === 'plugin1');
    expect(exists).not.toBeDefined();
  });

  it('the plugin2 and plugin3 should be in the "default" group.', () => {
    const p2 = groups.default.find(plugin => plugin.name === 'plugin2');
    const p3 = groups.default.find(plugin => plugin.name === 'plugin3');
    expect(p2).toBeDefined();
    expect(p3).toBeDefined();
  });

  it('the plugin2 and plugin3 should not be in the "pre" group.', () => {
    const p2 = groups.pre.find(plugin => plugin.name === 'plugin2');
    const p3 = groups.pre.find(plugin => plugin.name === 'plugin3');
    expect(p2).not.toBeDefined();
    expect(p3).not.toBeDefined();
  });

  it('the plugin2 and plugin3 should not be in the "post" group.', () => {
    const p2 = groups.post.find(plugin => plugin.name === 'plugin2');
    const p3 = groups.post.find(plugin => plugin.name === 'plugin3');
    expect(p2).not.toBeDefined();
    expect(p3).not.toBeDefined();
  });


  it('the plugin4 should be in the "post" group.', () => {
    const exists = groups.post.find(plugin => plugin.name === 'plugin4');
    expect(exists).toBeDefined();
  });

  it('the plugin4 should not be in the "default" group.', () => {
    const exists = groups.default.find(plugin => plugin.name === 'plugin4');
    expect(exists).not.toBeDefined();
  });

  it('the plugin4 should not be in the "pre" group.', () => {
    const exists = groups.pre.find(plugin => plugin.name === 'plugin4');
    expect(exists).not.toBeDefined();
  });
});
