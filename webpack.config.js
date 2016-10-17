module.exports = {
	entry: './src/js/main.js',
	output: {
		path: 'build/js',
		filename: 'bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /(node_modules)|(routes)|(public)/,
				loader: 'babel',
				query: {
					presets: ['es2015'/*, 'react'*/]
				}
			}
		]
	}
};
