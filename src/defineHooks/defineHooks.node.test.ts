import { defineHooks } from './defineHooks';
import { noop } from '@pastweb/tools';
import { Hooks, HookType } from '../types';

const hooks: Hooks = defineHooks({
  first: {
    args: 'firstArg',
  },
  second: {
    type: HookType.parallel,
    args: ['second1', 'second2'],
    callback: noop,
  },
  third: {
    type: HookType.waterfall,
  },
  forth: {
    type: HookType.waterfall,
    args: () => true,
  }
});

describe('defineHooks', () => {
  describe('not valid hook name', () => {
    it('name hook should throw an error.', () => {
      const hook = {
        name: {
          type: HookType.sequential,
        },
      };

      expect(() => defineHooks(hook)).toThrow(new Error(`Cli error - The "name" hook name is private, please choose a different hook name.`));
    });

    it('apply hook should throw an error.', () => {
      const hook = {
        apply: {
          type: HookType.sequential,
        },
      };

      expect(() => defineHooks(hook)).toThrow(new Error(`Cli error - The "apply" hook name is private, please choose a different hook name.`));
    });

    it('enforce hook should throw an error.', () => {
      const hook = {
        enforce: {
          type: HookType.sequential,
        },
      };

      expect(() => defineHooks(hook)).toThrow(new Error(`Cli error - The "enforce" hook name is private, please choose a different hook name.`));
    });
  });

  describe('first hook', () => {
    it('the first hook type should be "sequential"', () => {
      expect(hooks.first.type).toBe(HookType.sequential);
    });

    it('the first hook args should be "firstArg"', () => {
      expect(hooks.first.args).toBe('firstArg');
    });

    it('the first hook callback should be a function.', () => {
      expect(typeof hooks.first.callback).toBe('function');
    });
  });

  describe('second hook', () => {
    it('the second hook type should be "parallel"', () => {
      expect(hooks.second.type).toBe(HookType.parallel);
    });

    it('the second hook args should be ["second1", "second2"]', () => {
      expect(Array.isArray(hooks.second.args)).toBe(true);
      expect(hooks.second.args.length).toBe(2);
      expect(hooks.second.args[0]).toBe('second1');
      expect(hooks.second.args[1]).toBe('second2');
    });

    it('the second hook callback should be a function.', () => {
      expect(typeof hooks.second.callback).toBe('function');
    });
  });

  describe('third hook', () => {
    it('the third hook type should be "waterfall"', () => {
      expect(hooks.third.type).toBe(HookType.waterfall);
    });

    it('the third hook args should be undefined', () => {
      expect(hooks.third.args).toBe(undefined);
    });

    it('the third hook callback should be a function.', () => {
      expect(typeof hooks.third.callback).toBe('function');
    });
  });

  describe('forth hook', () => {
    it('the forth hook type should be "waterfall"', () => {
      expect(hooks.forth.type).toBe(HookType.waterfall);
    });

    it('the forth hook args should be a function', () => {
      expect(typeof hooks.forth.args).toBe('function');
    });

    it('the forth hook callback should be a function.', () => {
      expect(typeof hooks.forth.callback).toBe('function');
    });
  });
});
