/// <reference types="vitest" />

import path from 'path'
import { terser } from 'rollup-plugin-terser'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    terser({
      compress: {
        defaults: false,
        drop_console: true,
        arrows: true,
        booleans_as_integers: true,
        passes: 2,
      },
      mangle: {
        eval: true,
        module: true,
        toplevel: true,
        safari10: true,
        properties: false,
      },
      output: {
        comments: false,
        ecma: 2020,
      },
      keep_classnames: false,
      keep_fnames: false,
    }),
  ],

  // https://github.com/vitest-dev/vitest
  test: {
    environment: 'jsdom',
  },
})
