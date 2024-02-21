import pico from 'picocolors';
import { Help } from './types';

type Colors = {
  param?: string;
  text?: string;
};

const paramRE = /<[a-zA-Z0-9_-]+>/g;

function setColors(str: string, colors: Colors): string {
  const { param, text } = colors;
  let newStr = str;
  const params = [...new Set(str.match(paramRE))];

  if(params) params.forEach(paramStr => {
    newStr = newStr.replace(new RegExp(paramStr, 'g'),
      (pico as any)[param as string](paramStr));
  });

  let comIndex = newStr.indexOf('`');

  while((comIndex != -1) || (comIndex > newStr.length)){
    const end = newStr.indexOf('`', comIndex+1);
    const command = newStr.substring(comIndex+1, end);
    
    newStr = newStr.replace(`\`${command}\``,
      (pico as any)[text as string](command));
    
      comIndex = newStr.indexOf('`');
  }
  
  return newStr;
}

export function printHelp (help: Help, colors?: Colors | null, header?: string) {
  const colorsFn = {
    param: (pico as any)[colors?.param || 'yellow'],
    text: (pico as any)[colors?.text || 'whiteBright'],
  };

	if(header) console.log(header);

  const { commandName, description } = help;

  if (commandName) {
    console.log(` - ${setColors(commandName, colorsFn)}`);
  }

  if (description) {
    if (Array.isArray(description)) {
      description.forEach(line => console.log(`\t\t${setColors(line, colorsFn)}`));
    } else {
      console.log(`\t\t${setColors(description, colorsFn)}`);
    }
  }

  console.log('\n');
}
