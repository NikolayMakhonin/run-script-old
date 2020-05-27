/* eslint-disable */

module.exports = {
	extends: ['pro'],
	rules    : {
		// Temporary disable: TypeError: Cannot read property 'value' of null (waiting for update babel-eslint)
		'template-curly-spacing': 'off',
		'object-curly-spacing': 'off',
		"indent": "off",
		"prefer-destructuring": "off",
		"no-sync": "off",
		"no-warning-comments": "warn",
		"array-bracket-newline": "off",
		"require-atomic-updates": "off",
	},

	env: {
		node: true,
		es6 : true
	},

	parser       : 'babel-eslint',
	parserOptions: {
		ecmaVersion                : 6,
		sourceType                 : 'module',
		allowImportExportEverywhere: false,
		codeFrame                  : true,
		babelOptions               : {
			configFile: './env/babel/configs/minimal.js'
		},
	},

	plugins: [
		'sonarjs',
		'html'
	],
	settings: {
		'html/indent'           : '+tab',
		'html/report-bad-indent': 'error',
		'html/html-extensions'  : ['.html', '.svelte']
	},

	overrides: [
		{
			files: ['src/*.html'],
			rules: {
				semi                : ['error', 'always'],
				'semi-style'        : ['error', 'last'],
				'prefer-rest-params': 'off',
				'no-var'            : 'off',
				'vars-on-top'       : 'off'
			},
			env: {
				browser: true,
				es6    : false,
				node   : false
			},
			parser       : 'espree',
			parserOptions: {
				ecmaVersion: 5
			}
		}
	]
}
