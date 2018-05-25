/* eslint-env node */
const path = require('path');

module.exports = function(config) {
	config.set({
		basePath: '..',
		frameworks: ['mocha', 'chai-sinon'],
		reporters: ['mocha'],
		singleRun: false,

		browsers: [process.env.KARMA_BROWSERS || 'Chrome'],

		files: [
			'tests/**/*.js'
		],

		exclude: [
			'tests/preact-versions/**/*.js'
		],

		preprocessors: {
			'tests/**/*.js': ['webpack'],
			'src/**/*.js': ['webpack']
		},

		client: {
			mocha: {
				timeout: 6000
			}
		},

		webpack: {
			mode: 'development',
			module: {
				rules: [
					{
						test: /\.jsx?$/,
						exclude: /node_modules/,
						loader: 'babel-loader',
						query: {
							sourceMap: false,
							presets: [['es2015', {modules: false, loose: true}]],
							plugins: [
								['babel-plugin-inferno', {imports: true}],
								['babel-plugin-transform-es2015-spread', { loose: true }],
								['transform-es2015-classes', { loose: true }],
								['babel-plugin-transform-object-rest-spread', { useBuiltIns: true }]
							]
						}
					},
					{
						test: /\.css$/,
						use: [
							{ loader: "style-loader" },
							{ loader: "css-loader" }
						]
					}
				]
			}
		},

		webpackMiddleware: {
			noInfo: true
		}
	});
};
