import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

const commonjsPlugin = commonjs({
  include: 'node_modules/**',
  namedExports: {
    // left-hand side can be an absolute path, a path
    // relative to the current directory, or the name
    // of a module in node_modules
    'node_modules/co/index.js': ['default', 'co'],
  },
});

function createCommonConfigByInput(input, fileName, umdName) {
  return [
    // CommonJS
    {
      input,
      output: { file: `lib/${fileName}.js`, format: 'cjs', indent: false },
      external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
      ],
      plugins: [commonjsPlugin, babel()],
    },

    // ES
    {
      input,
      output: { file: `es/${fileName}.js`, format: 'es', indent: false },
      external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
      ],
      plugins: [commonjsPlugin, babel()],
    },

    // ES for Browsers
    {
      input,
      output: { file: `es/${fileName}.mjs`, format: 'es', indent: false },
      plugins: [
        commonjsPlugin,
        nodeResolve({
          jsnext: true,
        }),
        replace({
          'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        terser({
          compress: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            warnings: false,
          },
        }),
      ],
    },

    // UMD Development
    {
      input,
      output: {
        file: `dist/${fileName}.js`,
        format: 'umd',
        name: umdName,
        indent: false,
        sourcemap: true,
      },
      plugins: [
        nodeResolve({
          jsnext: true,
        }),
        commonjsPlugin,
        babel({
          exclude: 'node_modules/**',
        }),
        replace({
          'process.env.NODE_ENV': JSON.stringify('development'),
        }),
      ],
    },

    // UMD Production
    {
      input,
      output: {
        file: `dist/${fileName}.min.js`,
        format: 'umd',
        name: umdName,
        indent: false,
        sourcemap: true,
      },
      plugins: [
        nodeResolve({
          jsnext: true,
        }),
        commonjsPlugin,
        babel({
          exclude: 'node_modules/**',
        }),
        replace({
          'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        terser({
          compress: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            warnings: false,
          },
        }),
      ],
    },
  ];
}

export default [
  ...createCommonConfigByInput('src/index.js', 'redux-center', 'ReduxCenter'),
  ...createCommonConfigByInput(
    'src/generators-to-async.js',
    'generators-to-async',
    'GeneratorsToAsync'
  ),
];
