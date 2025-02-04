const json = require('@rollup/plugin-json');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const {babel} = require('@rollup/plugin-babel');
const vue = require('@vitejs/plugin-vue');
const scss = require('rollup-plugin-scss');
const terser = require('@rollup/plugin-terser');
const pkg = require('./package.json');

module.exports = {
    input: 'src/index.js',
    output: {
        file: pkg.module,
        format: 'esm',
        compact: true,
        name: 'MyBundle',
        assetFileNames: '[name].[ext]'
    },
    external: ['lodash', ...Object.keys(pkg.peerDependencies || [])],
    plugins: [
        json(),
        resolve({
            extensions: ['.js', '.vue', '.json'],
        }),
        commonjs(),
        vue(),
        scss({
            output: (styles, styleNodes) => {
                require('fs').writeFileSync('dist/vue-hawksearch.css', styles);
            },
            outputStyle: 'compressed'
        }),
        babel({
            extensions: ['.js', '.vue'],
            babelHelpers: 'bundled',
        }),
        terser(),
    ],
};
