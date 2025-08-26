import { solidPlugin } from 'esbuild-plugin-solid';
import { type Options, defineConfig } from 'tsup';

function generateConfig(): Options {
  return {
    target: 'es6',
    platform: 'browser',
    format: 'esm',
    splitting: false,
    clean: true,
    dts: true,
    entry: ['src/index.tsx'],
    outDir: 'dist/',
    treeshake: { preset: 'smallest' },
    replaceNodeEnv: true,
    sourcemap: true,
    minify: true,
    esbuildPlugins: [solidPlugin()],
    esbuildOptions(options) {
      options.jsx = 'automatic';
      options.jsxImportSource = 'solid-js';
      options.drop = ['console', 'debugger'];
    },
  };
}

export default defineConfig(generateConfig());
