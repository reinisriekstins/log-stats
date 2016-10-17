//const webpack = require('webpack');

module.exports = {
	entry: ['babel-polyfill', './src/js/main'],
	output: {
		path: 'build/js',
		filename: 'bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				loader: 'babel',
				query: {
					presets: ['es2015'/*, 'react'*/]
				}
			},
			{
				test: /\.scss$/,
				loader: 'style-loader!css-loader!sass-loader'
			}
		]
	}
};
