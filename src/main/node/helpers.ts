// eslint-disable-next-line max-len
/* eslint-disable no-unused-vars,callback-return,no-process-exit,no-process-env,no-extra-semi,@typescript-eslint/no-extra-semi */
import {spawn} from 'child_process'
import colors from 'kleur'
// import spawn from 'spawn-command-with-kill'
import psTree from 'ps-tree'
import readline from 'readline'
import {Writable} from 'stream'
import {IRunOptions, RunStatus} from './contracts'
import {getGlobalConfig} from './globalConfig'
import path from 'path'
// import kill from 'tree-kill'

// region helpers

function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

// region color

export function getColorPrefix(colorFunc) {
	const colorText = colorFunc('COLOR')
	return colorText.match(/^(.*)COLOR/s)[1]
}

// eslint-disable-next-line @typescript-eslint/no-shadow
export function createColorRegexp(colors: colors.Color[]) {
	return new RegExp(`[^\\r\\n]*(${colors
		.map(getColorPrefix)
		.map(escapeRegExp)
		.join('|')})[^\\r\\n]*`)
}

export function removeColor(message) {
	// eslint-disable-next-line no-control-regex
	return message.replace(/\u001B\[\d+m/g, '')
}

// endregion

// endregion

// region output handlers

// region stdOutSearchError

// const errorTextRegExp = /\b(err(ors?)?|warn(ings?)?|fail(ed|ure|s)?)\b|[✗]/i
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

function stdOutSearchError(text: string) {
	return getGlobalConfig().stdOutSearchError
		? getGlobalConfig().stdOutSearchError(text, _stdOutSearchError)
		: _stdOutSearchError(text)
}

function _stdOutSearchError(text: string) {
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
}

// endregion

// region stdErrIsError

function correctLog(message) {
	message = message.replace(/^\s{20,}/, '')
	return message
}

function stdErrIsError(text: string) {
	return getGlobalConfig().stdErrIsError
		? getGlobalConfig().stdErrIsError(text, _stdErrIsError)
		: _stdErrIsError(text)
}

function _stdErrIsError(text: string) {
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
}

// endregion

// region logFilter

function logFilter(text: string) {
	return getGlobalConfig().logFilter
		? getGlobalConfig().logFilter(text, _logFilter)
		: _logFilter(text)
}

function _logFilter(text: string) {
	text = removeColor(text)

	// sapper export
	if (/\s{4,}\S\s[^\w\r\n]*node_modules/.test(text)) {
		return false
	}

	// Empty space
	if (/^\s*$/s.test(text)) {
		return false
	}

	return true
}

// endregion

// endregion

// interface ProcessEnvOptions {
// 	uid?: number;
// 	gid?: number;
// 	cwd?: string;
// 	env?: NodeJS.ProcessEnv;
// 	/**
// 	 * @default true
// 	 */
// 	windowsHide?: boolean;
// 	/**
// 	 * @default 0
// 	 */
// 	timeout?: number;
// 	argv0?: string;
// 	stdio?: StdioOptions;
// 	detached?: boolean;
// 	shell?: boolean | string;
// 	windowsVerbatimArguments?: boolean;
// 	stdio?: 'pipe' | Array<null | undefined | 'pipe'>;
// }

let wasKillAll
const processList = []
const runStates = []

process.on('SIGTERM', () => {
	console.log('SIGTERM')
	killAll(true)
})
process.on('SIGHUP', () => {
	console.log('SIGHUP')
	killAll(true)
})
process.on('SIGINT', () => {
	console.log('SIGINT')
	killAll(true)
})
process.on('SIGBREAK', () => {
	console.log('SIGBREAK')
	killAll(true)
})

process.on('beforeExit', () => {
	console.log('beforeExit...')
	// killAll()
})
process.on('exit', () => {
	console.log('exit')
	killAll()
})

// process.on('disconnect', killAll)
process.on('uncaughtException', err => {
	printError('uncaughtException', err)
	killAll(true)
})

function printRunStates() {
	for (let i = 0; i < runStates.length; i++) {
		const state = runStates[i]

		const message = `${state.status} (${
			((state.timeEnd || Date.now()) - state.timeStart) / 1000
		} sec): ${state.description}`

		switch (state.status) {
			case RunStatus.RUNNED:
				console.log(colors.blue(message))
				break
			case RunStatus.SUCCESS:
				console.log(colors.cyan(message))
				break
			case RunStatus.ERROR:
				console.error(colors.red(message))
				break
			default:
				throw new Error(`Unknown status: ${state.status}`)
		}
	}
}

function printError(prefix, err) {
	console.error(colors.red().bold(`${prefix}: ${err && err.stack || err && err.toString() || err}`))
}

function addProcess(proc) {
	processList.push(proc)
}

function _killByPidsUnix(...pids) {
	if (!pids.length) {
		return
	}

	const params = pids.map(o => o.toString())
	params.unshift('-15')
	console.log(`kill ${params.join(' ')}`)

	spawn('kill', params, {
		detached: true,
		stdio   : 'ignore',
	})
		// .on('error', err => printError('kill error', err))
		.unref()
}

function killByPidsUnix(...pids) {
	if (!pids.length) {
		return
	}

	_killByPidsUnix(...pids)

	for (let i = 0; i < pids.length; i++) {
		psTree(pids[i], (err, children) => {
			if (err) {
				printError('psTree error', err)
				children = []
			}

			_killByPidsUnix(...children.map(o => o.PID))
		})
	}
}

function killByPidsWindows(...pids) {
	if (!pids.length) {
		return
	}

	const params = ['/F', '/T']
	for (let i = 0; i < pids.length; i++) {
		params.push('/PID')
		params.push(pids[i].toString())
	}
	console.log(`taskkill ${params.join(' ')}`)
	spawn('taskkill', params, {
		detached: true,
		stdio   : 'ignore',
	})
		// .on('error', err => printError('kill error', err))
		.unref()
}

function killByPids(...pids) {
	if (pids.length) {
		// console.log(`Kill All: ${pids.join(' ')}`)
		if (process.platform === 'win32') {
			killByPidsWindows(...pids)
		} else {
			killByPidsUnix(...pids)
		}
	}
}

function killAll(isFailure?: boolean) {
	if (wasKillAll) {
		return
	}
	wasKillAll = true

	console.log('Terminating...')

	setTimeout(() => {
		const procs = processList.filter(o => o.pid && !o.killed && o.pid !== process.pid)
		const pids = procs.map(o => o.pid)
		printRunStates()
		killByPids(...pids)
		if (isFailure || runStates.some(o => o.status === RunStatus.ERROR)) {
			process.exit(1)
		}
	}, 100)
}

// Buffer class
type BufferEncoding = 'ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'latin1' | 'binary' | 'hex';

interface IRunResult {
	out: string
	err: string
	both: string
}

export function run(command, {
	env,
	cwd,
	timeout,
	notAutoKill,
	stdin,
	shell = true,
	prepareProcess,
	dontSearchErrors,
	ignoreProcessExitCode,
	dontShowOutputs,
	returnOutputs,
}: IRunOptions = {}): Promise<IRunResult> {
	return new Promise<IRunResult>((resolve, reject) => {
		if (wasKillAll) {
			reject('Was kill all')
			return
		}

		const currentDir = process.cwd()
		cwd = path.resolve(cwd || currentDir)
		let cwdRelative = path.relative(currentDir, cwd)
		if (cwdRelative.startsWith('..')) {
			cwdRelative = cwd
		}
		if (cwdRelative === '.') {
			cwdRelative = ''
		}

		const description = `${cwdRelative ? cwdRelative + '> ' : ''}${command}`

		console.log(colors.blue(`RUN: ${description}`))

		const runState = {
			status   : RunStatus.RUNNED,
			timeStart: Date.now(),
			timeEnd  : void 0 as number,
			command,
			description,
		}
		runStates.push(runState)

		const proc = spawn(
			command,
			{
				cwd,
				env: {
					...process.env,
					...env,
				},
				timeout,
				stdio: [stdin, stdin, stdin],
				shell,
			})

		let stdoutString: string = void 0
		let stderrString: string = void 0
		let stdbothString: string = void 0

		const _resolve = () => {
			runState.status = RunStatus.SUCCESS
			runState.timeEnd = Date.now()
			Promise.all([
				proc.stdout && new Promise(r => {
					proc.stdout.on('end', r)
					if (proc.stdout.readableEnded) {
						r()
					}
				}),
				proc.stderr && new Promise(r => {
					proc.stderr.on('end', r)
					if (proc.stderr.readableEnded) {
						r()
					}
				}),
			])
				.then(() => {
					resolve(
						returnOutputs
							? {
								out : stdoutString,
								err : stderrString,
								both: stdbothString,
							}
							: void 0,
					)
				})
		}

		const _reject = err => {
			runState.status = RunStatus.ERROR
			runState.timeEnd = Date.now()
			reject(err)
		}

		if (returnOutputs) {
			if (proc.stdout) {
				stdoutString = ''
				stdbothString = ''
				proc.stdout.on('data', chunk => {
					// const encoding = proc.stdout.readableEncoding
					const str = chunk.toString() // encoding === 'buffer' ? void 0 : encoding)
					stdoutString += str
					stdbothString += str
				})
			}

			if (proc.stderr) {
				stderrString = ''
				stdbothString = ''
				proc.stderr.on('data', chunk => {
					// const encoding = proc.stdout.readableEncoding
					const str = chunk.toString() // encoding === 'buffer' ? void 0 : encoding)
					stderrString += str
					stdbothString += str
				})
			}
		}

		if (!notAutoKill) {
			addProcess(proc)
		}

		proc
			.on('disconnect', () => {
				_reject('process.disconnect')
			})
			.on('close', (code, signal) => {
				if (!ignoreProcessExitCode && code) {
					_reject(`process.close(code=${code}, signal=${signal})`)
				} else {
					_resolve()
				}
			})
			.on('exit', (code, signal) => {
				if (!ignoreProcessExitCode && code) {
					_reject(`process.exit(code=${code}, signal=${signal})`)
				} else {
					_resolve()
				}
			})
			.on('message', (message) => {
				console.log(`process.message: ${message}`)
			})
			.on('error', err => {
				_reject(err)
			})

		if (proc.stdout) {
			readline.createInterface({
				input   : proc.stdout,
				terminal: false,
			}).on('line', line => {
				try {
					const error = !dontSearchErrors && stdOutSearchError(line)
					if (!dontShowOutputs && logFilter(line)) {
						line = correctLog(line)
						process.stdout.write(`${line}\r\n`)
					}
					if (error) {
						_reject(`ERROR DETECTED: ${error}`)
					}
				} catch (ex) {
					_reject(ex)
				}
			})
		}

		if (proc.stderr) {
			readline.createInterface({
				input   : proc.stderr,
				terminal: false,
			}).on('line', line => {
				try {
					if (!dontSearchErrors && stdErrIsError(line)) {
						process.stdout.write(`STDERR: ${line}\r\n`)
						_reject(line)
						return
					}
					if (!dontShowOutputs && logFilter(line)) {
						line = correctLog(line)
						process.stdout.write(`${line}\r\n`)
					}
				} catch (ex) {
					_reject(ex)
				}
			})
		}

		if (prepareProcess) {
			prepareProcess(proc)
		}
	}).catch(err => {
		if (!wasKillAll) {
			console.error(colors.bold().red(`✗ ${command}\r\n${err && err.stack || err && err.toString() || err}`))
			return Promise.reject(err)
		}
		return null
	})
}

export const runOnce: typeof run = singleCall(run)

// eslint-disable-next-line no-extend-native
;(Promise.prototype as any).stopOnError = function stopOnError() {
	return this.catch(err => {
		printError('Kill on error', err)
		killAll(true)
	})
}

export function singleProcess(func) {
	let locker
	return async (...args) => {
		await locker
		locker = func(...args)
		return locker
	}
}

export function singleCall(func) {
	const cache = {}

	return (...args) => {
		const id = JSON.stringify(args)
		const cacheItem = cache[id]
		if (cacheItem) {
			if (cacheItem.error) {
				throw cacheItem.error
			}
			return cacheItem.result
		}

		if (cacheItem === false) {
			throw new Error(`Recursive call of single call func: ${func.toString()}`)
		}
		cache[id] = false

		try {
			const result = func(...args)
			cache[id] = {result}
			return result
		} catch (error) {
			cache[id] = {error}
			throw error
		}
	}
}
