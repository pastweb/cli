import prettyjson from 'prettyjson';
import { isObject } from '@pastweb/tools';
import pico from 'picocolors';
import { CliWarningMessage } from './types';

export function printWarning (warning: CliWarningMessage, color?: string | null, header?: string): void {
	const colorFn = (pico as any)[color || 'yellow'];

	if (header) console.log(colorFn(`\n${header}\n`));

	if (isObject(warning) || Array.isArray(warning)) {
    console.log(colorFn(prettyjson.render(warning)));
  } else {
    console.log(colorFn(warning));
  }

	console.log('\n');
}
