import { printHelp } from '../printHelp';
import { printWarning } from '../printWarning';
import { Commands, CommandsInput, Help } from '../types';

export async function runCommand(commands: Commands, commandsInput: CommandsInput): Promise<boolean | void> {
  const commandsHelp = Object.values(commands)
  .map(({ help }) => help)
  .filter(help => help);
  const [ firstCommand ] = Object.keys(commandsInput);

  if (!commands[firstCommand]) {
    printWarning(firstCommand, null, 'Command not found:')
    commandsHelp.forEach(help => printHelp(help as Help));
    return false;
  } else {
    const { command } = commands[firstCommand];
    const value = await command();
    return typeof value === 'undefined' ? true : value;
  }
}
