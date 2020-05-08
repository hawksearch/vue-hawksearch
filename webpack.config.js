import * as path from 'path';
import * as VueLoaderPlugin from 'vue-loader/lib/plugin';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';

module.exports = {
    entry: {
        main: ['./src/index.js']
    },
    output: {
        filename: 'vue-hawksearch.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.min.js',
            src: path.resolve(__dirname, 'src')
        },
        extensions: ['*', '.js', '.vue', '.json']
    },
    mode: "development",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'
                    //options: {
                    //    presets: [
                    //        [
                    //            '@babel/preset-env',
                    //            {
                    //                "targets": {
                    //                    "esmodules": true,
                    //                    "browsers": ['last 2 versions']
                    //                },
                    //                "modules": false
                    //            }
                    //        ]
                    //    ],
                    //    plugins: [
                    //        //'@babel/plugin-proposal-object-rest-spread',
                    //        //'@babel/plugin-syntax-dynamic-import',
                    //        //'@babel/plugin-proposal-class-properties',
                    //        //'babel-plugin-transform-export-extensions',
                    //        //'@babel/plugin-proposal-export-default-from',
                    //        //'babel-plugin-transform-es2015-modules-commonjs',
                    //        ['@babel/plugin-transform-runtime', { useESModules: true }]
                    //    ]
                    //}
                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    { loader: 'css-loader' },
                    { loader: 'sass-loader' }
                ]
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: 'vue-hawksearch.css',
        })
    ]
};