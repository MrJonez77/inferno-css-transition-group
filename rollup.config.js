import path from 'path';
import babel from 'rollup-plugin-babel';
import {uglify} from 'rollup-plugin-uglify';

let external = {
	inferno: 'Inferno',
	'inferno-vnode-flags': 'Inferno',
	'inferno-extras': 'Inferno'
};

const outputs = [];
const plugins = [
	babel({
		exclude: 'node_modules/**',
		babelrc: false,
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
	})
];

if (process.env.BUILD === 'production') {
	outputs.push({
		name: 'InfernoTransitionGroup',
		format: 'umd',
		file: path.join(__dirname, 'dist', 'inferno-css-transition-group.min.js'),
		sourcemap: true,
		globals: external
	});

	plugins.push(
		uglify({
			compress: {
				// compress options
				booleans: true,
				dead_code: true,
				drop_debugger: true,
				unused: true,
				keep_fnames: false,
				keep_infinity: true,
				passes: 3
			},
			ie8: false,
			mangle: {
				toplevel: true
			},
			parse: {
				html5_comments: false,
				shebang: false
			},
			toplevel: false,
			warnings: false
		})
	);
} else {
	outputs.push({
		name: 'InfernoTransitionGroup',
		format: 'umd',
		file: path.join(__dirname, 'dist', 'inferno-css-transition-group.js'),
		sourcemap: false,
		globals: external
	});
	outputs.push({
		name: 'InfernoTransitionGroup',
		format: 'cjs',
		file: path.join(__dirname, 'dist', 'inferno-css-transition-group.cjs.js'),
		sourcemap: false,
		globals: external
	});
	outputs.push({
		name: 'InfernoTransitionGroup',
		format: 'es',
		file: path.join(__dirname, 'dist', 'inferno-css-transition-group.es.js'),
		sourcemap: false,
		globals: external
	});
}

export default {
	input: path.join(__dirname, 'src/index.js'),
	output: outputs,
	plugins
};
