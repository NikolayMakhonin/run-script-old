/* eslint-disable @typescript-eslint/no-unused-vars */
const colors = require('kleur')
const {createColorRegexp, removeColor} = require('./dist/dev/js/main/node')

const errorTextRegExp = /[^\r\n]*(\b[1-9]\d* *(fail|err)|[✗×]|fatal error|error occur)[^\r\n]*/i
const errorColorRegExp = createColorRegexp([
	colors.bold,
	colors.red,
	colors.magenta,
	// colors.yellow,
	colors.bgRed,
	colors.bgMagenta,
	// colors.bgYellow,
])

module.exports = {
	logFilter(text) {
		// sapper export
		if (/\s{4,}\S\s[^\w\r\n]*node_modules/.test(text)) {
			return false
		}

		// Empty space
		if (/^\s*$/s.test(text)) {
			return false
		}

		return true
	},
	stdOutSearchError(text, next) {
		const errorColor = text.match(errorColorRegExp)
		text = removeColor(text)

		if (errorColor
			// at least 10 letters
			&& (/(\w\W*){10,}/s).test(text)
			&& !(/√/s).test(text)
			// electron-builder
			&& !(/[┌│]/s).test(text)
			// sapper: "189 kB client.905ef984.js"
			&& !(/\b\d+\s+\w+\s+\S+\.js\b/.test(text) && text.length < 100)
		) {
			return `ERROR COLOR: ${errorColor[0]}`
		}

		const errorText = text.match(errorTextRegExp)
		if (errorText) {
			return `ERROR TEXT: ${errorText[0]}`
		}

		return false

		// return next(text)
	},
	stdErrIsError(text, next) {
		text = removeColor(text)

		if (text.length < 20) {
			return false
		}

		if (/openssl config failed/.test(text)) {
			return false
		}

		// web storm
		if (/Debugger attached|Debugger listening on|Waiting for the debugger|nodejs.*inspector/.test(text)) {
			return false
		}

		// rollup
		if (/treating it as an external dependency|\bcreated\b.*\.js in \d|\bFinished in\b/.test(text)) {
			return false
		}
		if (text.indexOf('→') >= 0) {
			return false
		}

		// someone package is outdated
		if (/\bnpm update\b/.test(text)) {
			return false
		}

		// terminate process
		if (/^\^[A-Z]$/.test(text)) {
			return false
		}

		// experimental warnings
		if (/ExperimentalWarning: Conditional exports is an experimental feature. This feature could change at any time/.test(text)) {
			return false
		}

		// Entry module "rollup.config.js" is implicitly using "default" export mode,
		// which means for CommonJS outputthat its default export is assigned to "module.exports".
		// For many tools, such CommonJS output will not be interchangeable with the original ES module.
		// If this is intended, explicitly set "output.exports" to either "auto" or "default",
		// otherwise you might want to consider changing the signature of "rollup.config.js"
		// to use named exports only.
		if (/explicitly set "output.exports" to either "auto" or "default"/.test(text)) {
			return false
		}

		return true
	},
}
