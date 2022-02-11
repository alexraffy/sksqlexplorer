
const webpack = require('webpack');

const path = require('path');

module.exports = {
    mode: "production",
    entry: './build/index.js',
    output: {
        filename: 'sksqlexplorer.min.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        fallback: {
            "worker_threads": false,
            "perf_hooks": false,
            "ws": false
        }
    },
    optimization: {
        minimize: false
    },

};