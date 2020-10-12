import pkg from './package.json'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

export default [
    {
        input: 'src/index.js',
        output: { 
            file: pkg.main, 
            format: 'cjs'
        },
        plugins: [
            nodeResolve(),
            commonjs(),
            json(),
            terser()
        ]
    }
]