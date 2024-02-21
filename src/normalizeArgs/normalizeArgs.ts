import { ArgsFunction } from '../types';

export async function normalizeArgs(args: any | any[] | ArgsFunction = []): Promise<any> {
  let _args: any | any[] | ArgsFunction = [];

  if (typeof args === 'function') {
    const result = await (args as ArgsFunction)();
    _args = !result ? [] : Array.isArray(result) ? result : [result];
  } else {
    _args = !args ? [] : Array.isArray(args) ? args : [args];
  }

  return _args;
}
