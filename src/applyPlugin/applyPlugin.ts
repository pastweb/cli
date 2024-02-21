import { CommandsInput } from '../types';

export function applyPlugin(
  apply: string | string[] | undefined | ((commadsInput: CommandsInput) => boolean),
  commadsInput: CommandsInput,
): boolean {
  if (typeof apply === 'undefined') return true;
  if (typeof apply === 'function') return apply(commadsInput);

  const applyArr = Array.isArray(apply) ? apply : [apply];

  return applyArr.map(command => {
    const applyComponents = command.split('/');
    const commands = Object.keys(commadsInput);

    for (let i=0; i < applyComponents.length; i++) {
      const command = applyComponents[i];
      if (commands[i] !== command) return false;
    }

    return true;
  })
  .some(result => result);
}
