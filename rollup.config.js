import pkg from './package.json';
import resolve from '@rollup/plugin-node-resolve';
import vuePlugin from 'rollup-plugin-vue';
import scss from 'rollup-plugin-scss'

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
		vuePlugin({
			css: false
		}),
		scss({
			outputStyle: 'compressed'
		})
	],
};

export default config;
