import {defineConfig, coverageConfigDefaults} from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    coverage: {
      reporter: ['lcov', 'text', 'html'],
      exclude: [
        ...coverageConfigDefaults.exclude,
        '*/index.*' // 本当はindex.tsをexcludeしたい
      ],
    },
  },
});
