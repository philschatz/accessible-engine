import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'

export default {
    input: './src/browser.ts',
    output: {
        file: './browser.bundle.js',
        format: 'umd',
        name: 'GameEngine',
        sourcemap: true
    },
    plugins: [
        json(),
        typescript({module: 'ESNext'}),
        resolve(),
        commonjs({
            namedExports: {
              'euclideanmst': ['euclideanMST']
            }
          }),
    ]
}