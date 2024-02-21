import { normalizeValue } from './normalizeValue';
import { optionRE, optionWithValueRE, sqareRE, curlyRE } from './constants';
import type { CommandsInput } from '../types';
import type { ArrayValue, ObjectValue, OptionValue } from './types';

export function getCommandInput(argv: string | string[] = []): CommandsInput {
  let _argv = typeof argv === 'string' ? argv.split(' ') : [...argv];

  if (optionRE.test(_argv[0])) {
    _argv = ['none', ..._argv];
  }

  const commandInput: CommandsInput = {};
  let i = 0;

  while(_argv[i]) {
    const commandName = _argv[i];
    commandInput[commandName] = {};
    i++;

    while(optionRE.test(_argv[i])) {
      let option = _argv[i];

      if (optionWithValueRE.test(option)) {
        const isSquare = sqareRE.test(option);
        const isCurly = curlyRE.test(option);

        if (isSquare || isCurly) {
          let j = i + 1;
          let element = _argv[j];
          
          while(isSquare ? !/\]$/.test(element) : !/}$/.test(element)) {
            element = _argv[j];
            option = `${option}${element}`;
            j++;
          }
          
          i = j;
        }

        option = option.replace(/ /g, '');
      }

      let [optName, value] = option.replace(/^-+/g, '').split('=');

      if (!value) {
        commandInput[commandName][optName] = true;
        i++;
        continue;
      }

      const isSquare = value.startsWith('[');
      const isCurly = value.startsWith('{');

      if (!isSquare && !isCurly) {
        commandInput[commandName][optName] = normalizeValue(value);
        i++;
        continue;
      }

      value = value.replace(/['"]/g, '');
      const optionValue: OptionValue = isSquare ? [] : {};

      value.substring(1, value.length - 1).split(',').forEach((val: string) => {
        let k: string = '';
        let v: string | number | boolean = '';

        if (isCurly) {
          const _val = val.split(':');
          k = _val[0];
          v=  normalizeValue(_val[1]);
        } else {
          v = normalizeValue(val);
        }
        
        if (k) {
          (optionValue as ObjectValue)[k] = v;
        } else {
          (optionValue as ArrayValue).push(v);
        }
      });

      commandInput[commandName][optName] = optionValue;
    }
  }
  
  return commandInput;
}
