import prettyjson from 'prettyjson';
import { isObject } from '@pastweb/tools';
import pico from 'picocolors';
import { CliInfoMessage } from './types';

export function printInfo(info: CliInfoMessage, color?: string | null, header?: string): void {
  const colorFn = (pico as any)[color || 'cyan'];

  if (header) console.log(colorFn(`\n${header}\n`));

  if (isObject(info) || Array.isArray(info)) {
    console.log(colorFn(prettyjson.render(info)));
  } else {
    console.log(colorFn(info));
  }

  console.log('\n');
}