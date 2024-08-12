export default {
  versionFile: true,
  build: { target: 'lib' },
  output: {
    maia: false,
    package: {
      exports: {
        exclude: [
          /getCommandInput\/(constants|normalizeValue)/
        ],
      },
    },
  },
};
