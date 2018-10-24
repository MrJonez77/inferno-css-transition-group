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
                                ['@babel/plugin-transform-template-literals', { loose: true }],
                                '@babel/plugin-transform-sticky-regex',
                                ['@babel/plugin-transform-spread', { loose: true }],
                                '@babel/plugin-transform-shorthand-properties',
                                '@babel/plugin-transform-parameters',
                                '@babel/plugin-transform-object-super',
                                '@babel/plugin-transform-react-constant-elements',
								['@babel/plugin-transform-block-scoping', { throwIfClosureRequired: true }],
                                '@babel/plugin-transform-block-scoped-functions',
                                ['@babel/plugin-transform-destructuring', { loose: true }],
                                ['@babel/plugin-transform-computed-properties', { loose: true }],
                                '@babel/plugin-transform-arrow-functions',
                                ['@babel/plugin-transform-classes', { loose: true }],
                                ['@babel/plugin-proposal-object-rest-spread', { useBuiltIns: true }]
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
