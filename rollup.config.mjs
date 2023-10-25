import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';
import json from '@rollup/plugin-json';
import packageJson from "./package.json" assert { type: "json" };

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: packageJson.main,
                format: 'cjs',
                sourcemap: true,
            },
            {
                file: packageJson.module,
                format: 'esm',
                sourcemap: true,
            },
        ],
        plugins: [
            resolve({
                browser: true,
                preferBuiltins: false,
            }),
            commonjs(),
            json(),
            typescript({
                tsconfig: './tsconfig.json',
                exclude:["src/*.tsx", "src/*.ts"]
            }),
        ],
        external: ['react', 'react-dom'],
    },
    {
        input: 'dist/esm/types/index.d.ts',
        output: [{ file: "dist/index.d.ts", format: 'esm' }],
        plugins: [dts()],
        external: ['react', 'react-dom'],
    }
];