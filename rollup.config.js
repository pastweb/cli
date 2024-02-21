import { getRollupConfig } from '../../util/index';

export default getRollupConfig({
  input: 'src/index.ts',
  versionFile: './src/version.ts',
  parser: 'typescript',
});
