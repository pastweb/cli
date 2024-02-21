import { getCommandInput } from './getCommandInput';
import { isObject } from '@pastweb/tools';

const COMMAND_1 = 'build --config=./config.js';
const COMMAND_2 = '-v --env={ prod: true, priority: 1, type: spa }';
const COMMAND_3 = 'build --config=./config.js --env=[ true, mpa, 1 ] website --static';


describe('getCommandInput', () => {
  describe(`command: ${COMMAND_1}`, () => {
    const commandInput = getCommandInput(COMMAND_1.split(' '));

    it('commandInput should be an Object', () => {
      expect(isObject(commandInput)).toBe(true);
    });

    it('the "commandInput" Object should has the "build" key', () => {
      expect(Object.keys(commandInput).includes('build')).toBe(true);
    });

    it('the "build" option Object should be defined.', () => {
      expect(isObject(commandInput.build)).toBeDefined();
    });

    it('the "config" option should be a string', () => {
      expect(typeof commandInput.build.config).toBe('string');
      expect(commandInput.build.config).toBe('./config.js');
    });
  });

  describe(`command: ${COMMAND_2}`, () => {
    const commandInput = getCommandInput(COMMAND_2.split(' '));

    it('the "none" property should be an Object.', () => {
      expect(isObject(commandInput.none)).toBe(true);
    });

    it('the value of the option "-v" should be true.', () => {
      expect(commandInput.none.v).toBe(true);
    });

    it('the "env" option should be an Object.', () => {
      expect(isObject(commandInput.none.env)).toBe(true);
    });

    it('the "prod" should be a Boolean, "priority" a number, "type" a string.', () => {
      const { prod, priority, type } = commandInput.none.env as any;
      expect(typeof prod).toBe('boolean');
      expect(typeof priority).toBe('number');
      expect(typeof type).toBe('string');
    });
  });

  describe(`command: ${COMMAND_3}`, () => {
    const commandInput = getCommandInput(COMMAND_3.split(' '));

    it('the "build" property should be an Object.', () => {
      expect(isObject(commandInput.build)).toBe(true);
    });

    it('the "website" property should be an Object.', () => {
      expect(isObject(commandInput.website)).toBe(true);
    });

    it('the "config" option should be a string', () => {
      expect(typeof commandInput.build.config).toBe('string');
      expect(commandInput.build.config).toBe('./config.js');
    });

    it('the value of the option "--static" should be true.', () => {
      expect(commandInput.website.static).toBe(true);
    });

    it('the "env" option should be an array', () => {
      expect(Array.isArray(commandInput.build.env)).toBe(true);
    });

    it('the "env" option should be an array type like [boolean, string, number]', () => {
      const [first, second, third] = commandInput.build.env as any[];
      expect(typeof first).toBe('boolean');
      expect(typeof second).toBe('string');
      expect(typeof third).toBe('number');
    });
  });
});