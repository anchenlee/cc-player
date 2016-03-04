var path = require('path');

module.exports = {
    entry: './lib/index.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'cc-player.js',
        library: 'CCPlayer',
        libraryTarget: 'umd'
    }
};
