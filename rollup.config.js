//import resolve from 'rollup-plugin-node-resolve';
//import commonjs from 'rollup-plugin-commonjs';
//import babel from 'rollup-plugin-babel';
//import json from 'rollup-plugin-json';
//import postcss from 'rollup-plugin-postcss';
import alias from 'rollup-plugin-alias';
//import vue from 'rollup-plugin-vue'
import pkg from './package.json';

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
//import buble from '@rollup/plugin-buble';
//import replace from '@rollup/plugin-replace';
//import terser from 'rollup-plugin-terser';
import vuePlugin from 'rollup-plugin-vue';
import path from 'path';

const extensions = ['.mjs', '.web.ts', '.ts', '.web.tsx', '.tsx', '.web.js', '.js', '.json', '.web.jsx', '.jsx', '.vue'];

const customResolver = resolve({
	extensions
});

const projectRootDir = path.resolve(__dirname);

// our peer dependencies are considered external, and must be provided by the consumer
const external = Object.keys(pkg.peerDependencies);

const config = {
	input: 'src/index.js',

	output: {
		file: pkg.module,
		format: 'esm',
		sourcemap: true,
	},

	external,

	plugins: [
		//json(),
		//babel({
		//	//extensions,
		//	runtimeHelpers: true,
		//	configFile: './babel.config.js',
		//	exclude: 'node_modules/**',
		//}),
		resolve({
			extensions,
			browser: true,
			preferBuiltIns: false,
			customResolveOptions: {
				moduleDirectory: ['src', 'node_modules'],
			},
		}),
		//postcss({
		//	extract: true,
		//	minimize: true,
		//	sourceMap: true,
		//}),
		//commonjs({
		//	include: 'node_modules/**',
		//}),
		//alias({
		//	entries: {
		//		//vue: 'vue/dist/vue.min.js',
		//		src: __dirname + '/src'
		//	}
		//}),
		alias({
			entries: [
				{
					find: 'src',
					replacement: path.resolve(projectRootDir, 'src')
					// OR place `customResolver` here. See explanation below.
				}
			],
			customResolver
		}),
		vuePlugin(),
		//nodeResolve({
		//	extensions: ['.js', '.vue'],
		//	browser: true,
		//	preferBuiltins: true
		//}),
		commonjs(),
		//buble({ target: { chrome: 70 } }),
		//minify && terser.terser({ output: { comments: /^!/u } }),
	],
};

export default config;
