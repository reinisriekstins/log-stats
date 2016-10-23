//const webpack = require('webpack');

module.exports = {
	entry: {
		app: './src/js/main',
		//vendor: ['babel-polyfill', 'lodash', 'c3', 'jquery']
	},
	output: {
		path: 'dist/js',
		filename: 'bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				loader: 'babel',
				query: {
					presets: ['es2015'/*, 'react'*/],
					cacheDirectory: true
				}
			},
			{
				test: /\.scss$/,
				loader: 'style-loader!css-loader!sass-loader'
			},
			{
				test: /\.css$/,
				loader: 'style-loader!css-loader'
			}
		]
	},
	//plugins: [
  //  new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js")
  //]
};
