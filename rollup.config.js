import path from 'path';
import fs from 'fs';
import babel from 'rollup-plugin-babel';
import {uglify} from 'rollup-plugin-uglify';

let pkg = JSON.parse(fs.readFileSync('./package.json'));
let external = Object.keys(pkg.dependencies || {});

const outputs = [];
const plugins = [
	babel({
		exclude: 'node_modules/**',
		babelrc: false,
		presets: [['es2015', {modules: false, loose: true}]],
		plugins: [
			['babel-plugin-inferno', {imports: true}],
			['babel-plugin-transform-es2015-spread', { loose: true }],
			['transform-es2015-classes', { loose: true }],
			['babel-plugin-transform-object-rest-spread', { useBuiltIns: true }]
		]
	})
];

if (process.env.BUILD === 'production') {
	outputs.push({
		name: 'InfernoTransitionGroup',
		format: 'umd',
		file: path.join(__dirname, 'dist', 'inferno-css-transition-group.min.js'),
		sourcemap: true,
		global: external
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
		global: external
	});
	outputs.push({
		name: 'InfernoTransitionGroup',
		format: 'cjs',
		file: path.join(__dirname, 'dist', 'inferno-css-transition-group.cjs.js'),
		sourcemap: false,
		global: external
	});
	outputs.push({
		name: 'InfernoTransitionGroup',
		format: 'es',
		file: path.join(__dirname, 'dist', 'inferno-css-transition-group.es.js'),
		sourcemap: false,
		global: external
	});
}

export default {
	input: path.join(__dirname, 'src/index.js'),
	output: outputs,
	plugins: plugins
};
