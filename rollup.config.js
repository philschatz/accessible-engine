import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'
import minify from 'rollup-plugin-babel-minify'

const plugins = [
  json(),
  typescript({module: 'ESNext'}),
  resolve(),
  commonjs({
    namedExports: {
      'euclideanmst': ['euclideanMST']
    }
  }),
]

export default {
    input: './src/browser.ts',
    output: {
        file: './browser.bundle.js',
        format: 'umd',
        name: 'GameEngine',
        sourcemap: true
    },
    plugins: process.env['NODE_ENV'] === 'production' ? [...plugins, minify()] : plugins
}