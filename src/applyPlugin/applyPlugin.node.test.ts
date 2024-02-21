import { applyPlugin } from './applyPlugin';

const COMMAND_1 = {
  build: {},
};

const COMMAND_2 = {
  build: {},
  website: {},
};

const COMMAND_3 = {
  serve: {},
};

describe('applyPlugin', () => {
  describe('command: COMMAND_1', () => {
    it('the plugin should be applied for undefined.', () => {
      expect(applyPlugin(undefined, COMMAND_1)).toBe(true);
    });

    it('the plugin should be applied for build.', () => {
      expect(applyPlugin('build', COMMAND_1)).toBe(true);
    });

    it('the plugin should be not applied for serve.', () => {
      expect(applyPlugin('serve', COMMAND_1)).toBe(false);
    });
  });

  describe('command: COMMAND_2', () => {
    it('the plugin should be applied for undefined.', () => {
      expect(applyPlugin(undefined, COMMAND_2)).toBe(true);
    });

    it('the plugin should be applied for build.', () => {
      expect(applyPlugin('build', COMMAND_2)).toBe(true);
    });

    it('the plugin should be applied for build/website.', () => {
      expect(applyPlugin('build/website', COMMAND_2)).toBe(true);
    });

    it('the plugin should be not applied for build/spa.', () => {
      expect(applyPlugin('build/spa', COMMAND_2)).toBe(false);
    });
  });

  describe('command: COMMAND_1 | COMMAND_2 | COMMAND_3', () => {
    it('the plugin should be applied for build.', () => {
      expect(applyPlugin('build', COMMAND_1)).toBe(true);
    });

    it('the plugin should be applied for serve.', () => {
      expect(applyPlugin('serve', COMMAND_3)).toBe(true);
    });

    it('the plugin should be applied for [build, serve].', () => {
      expect(applyPlugin(['build', 'serve'], COMMAND_3)).toBe(true);
    });

    it('the plugin should be applied for [build, serve].', () => {
      expect(applyPlugin(['build', 'serve'], COMMAND_1)).toBe(true);
    });

    it('the plugin should be not applied for [build/website, serve].', () => {
      expect(applyPlugin(['build/website', 'serve'], COMMAND_1)).toBe(false);
    });

    it('the plugin should be applied for [build/website, serve].', () => {
      expect(applyPlugin(['build/website', 'serve'], COMMAND_2)).toBe(true);
    });

    it('the plugin should be applied for [build/website, serve].', () => {
      expect(applyPlugin(['build/website', 'serve'], COMMAND_3)).toBe(true);
    });

    it('the plugin should be applied for () => true.', () => {
      const applyFn = jest.fn(() => true);
      const isApplied = applyPlugin(applyFn, COMMAND_3);
      
      expect(applyFn).toBeCalledTimes(1);
      expect(applyFn).toHaveBeenCalledWith(COMMAND_3);
      expect(isApplied).toBe(true);
    });
  });
});