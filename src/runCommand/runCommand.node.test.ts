import { runCommand } from './runCommand';
import { getCommandInput } from '../getCommandInput';
import { Commands } from '../types';

const COMMAND = 'build --config=./config.js website --static';

const commandFn = jest.fn();

const commands: Commands = {
  build: {
    command: commandFn,
  }
};

const commandInput = getCommandInput(COMMAND);

describe('runCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('the command function should be called.', async () => {
    runCommand(commands, commandInput);
    expect(commandFn).toBeCalled();
  });

  it('the value returned should be true.', async () => {
    const commandValue = await runCommand(commands, commandInput);
    expect(commandValue).toBe(true);
  });

  it('the value returned should be true.', async () => {
    const commands: Commands = {
      build: {
        command: jest.fn(() => true),
      }
    };

    const commandValue = await runCommand(commands, commandInput);

    expect(commandValue).toBe(true);
  });

  it('the value returned should be false.', async () => {
    const commands: Commands = {
      build: {
        command: jest.fn(() => false),
      }
    };

    const commandValue = await runCommand(commands, commandInput);

    expect(commandValue).toBe(false);
  });
});
