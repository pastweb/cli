import prettyjson from 'prettyjson';
import { isObject } from '@pastweb/tools';
import pico from 'picocolors';
import { CliErrorMessage } from './types';

export function printError (error: CliErrorMessage, color?: string | null, header?: string): void {
  const colorFn = (pico as any)[color || 'red'];

  if (header) console.log(colorFn(`\n${header}\n`));

	if (isObject(error) || Array.isArray(error)) {
    console.log(colorFn(prettyjson.render(error)));
  } else {
    console.log(colorFn(error));
    console.log('\n');
    process.exit(1);
  }
};
