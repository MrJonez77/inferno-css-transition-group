/* eslint-env node */

module.exports = function(config) {
	config.set({
		basePath: '..',
		frameworks: ['mocha', 'chai-sinon'],
		reporters: ['mocha'],
		singleRun: true,

		browsers: [process.env.KARMA_BROWSERS || 'Chrome'],

		files: [
			'tests/**/*.js'
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
							babelrc: false,
							sourceMap: false,
                            plugins: [
                                ['babel-plugin-inferno', {imports: true}],
                                ['babel-plugin-transform-es2015-template-literals', { loose: true }],
                                'babel-plugin-transform-es2015-sticky-regex',
                                ['babel-plugin-transform-es2015-spread', { loose: true }],
                                'babel-plugin-transform-es2015-shorthand-properties',
                                'babel-plugin-transform-es2015-parameters',
                                'babel-plugin-transform-es2015-object-super',
                                'babel-plugin-transform-es2015-constants',
                                'babel-plugin-transform-es2015-block-scoping',
                                'babel-plugin-transform-es2015-block-scoped-functions',
                                ['babel-plugin-transform-es2015-destructuring', { loose: true }],
                                ['babel-plugin-transform-es2015-computed-properties', { loose: true }],
                                'babel-plugin-transform-es2015-arrow-functions',
                                ['babel-plugin-transform-es2015-classes', { loose: true }],
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
