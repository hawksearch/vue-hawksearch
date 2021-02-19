import pkg from './package.json';
import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import vuePlugin from 'rollup-plugin-vue';
import scss from 'rollup-plugin-scss'
import { terser } from 'rollup-plugin-terser';

const extensions = ['.mjs', '.web.js', '.js', '.json', '.vue'];

// our peer dependencies are considered external, and must be provided by the consumer
const external = Object.keys(pkg.peerDependencies);

const config = {
	input: 'src/index.js',

	output: {
		file: pkg.module,
		format: 'esm',
		compact: true
	},

	external,

	plugins: [
		resolve({
			extensions,
			browser: true,
			preferBuiltIns: false,
			customResolveOptions: {
				moduleDirectory: ['src', 'node_modules'],
			},
		}),
		babel({
			extensions: ['.js'],
			runtimeHelpers: true,
			exclude: 'node_modules/**',
			presets: [
				[
					"@babel/preset-env",
					{
						"targets": {
							"edge": "17",
							"firefox": "60",
							"chrome": "67",
							"safari": "11.1",
							"ie": "11"
						}
					}
				]
			],
			plugins: [
				'@babel/plugin-proposal-class-properties',
				'@babel/plugin-proposal-object-rest-spread',
				'@babel/plugin-transform-arrow-functions',
				'@babel/plugin-transform-destructuring',
				'@babel/plugin-syntax-dynamic-import',
				["@babel/plugin-proposal-decorators", { "decoratorsBeforeExport": true }]
			]
		}),
		vuePlugin({
			css: false
		}),
		scss({
			outputStyle: 'compressed'
		}),
		terser()
	],
};

export default config;
