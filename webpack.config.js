const path = require('path');

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
            'vue$': 'vue/dist/vue.min.js'
        },
        extensions: ['*', '.js', '.vue', '.json']
    },
    mode: "development",

};