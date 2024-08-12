import { noop } from '@pastweb/tools';
import { normalizeArgs } from './normalizeArgs';
import { defineHooks } from '../defineHooks';
import { HOOK_TYPE } from '../constants';
import { Hooks } from '../types';

const hooks: Hooks = defineHooks({
  first: {
    args: 'firstArg',
  },
  second: {
    type: HOOK_TYPE.parallel,
    args: ['second1', 'second2'],
    callback: noop,
  },
  third: {
    type: HOOK_TYPE.waterfall,
  },
  forth: {
    type: HOOK_TYPE.waterfall,
    args: () => true,
  }
});

describe('normalizeArgs', () => {
  it('the first hook args should be "[firstArg]"', async () => {
    const args = await normalizeArgs(hooks.first.args);
    expect(Array.isArray(args)).toBe(true);
    expect(args[0]).toBe('firstArg');
    expect(args.length).toBe(1);
  });

  it('the second hook args should be "[second1, second]"', async () => {
    const args = await normalizeArgs(hooks.second.args);
    expect(Array.isArray(args)).toBe(true);
    expect(args[0]).toBe('second1');
    expect(args[1]).toBe('second2');
    expect(args.length).toBe(2);
  });

  it('the third hook args should be []', async () => {
    const args = await normalizeArgs(hooks.third.args);
    expect(Array.isArray(args)).toBe(true);
    expect(args.length).toBe(0);
  });

  it('the forth hook args should be [true]', async () => {
    const args = await normalizeArgs(hooks.forth.args);
    expect(Array.isArray(args)).toBe(true);
    expect(args.length).toBe(1);
    expect(args[0]).toBe(true);
  });
});
