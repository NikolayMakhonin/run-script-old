import {ChildProcess} from 'child_process'
import {Stream} from 'stream'

export interface ProcessEnv {
	[key: string]: string | undefined;
}

type StdioOptions =
	'pipe'
	| 'ignore'
	| 'inherit'
	| Array<('pipe' | 'ipc' | 'ignore' | 'inherit' | Stream | number | null | undefined)>;

type StdioNull = 'inherit' | 'ignore' | Stream;
type StdioPipe = undefined | null | 'pipe';
type StdioPipeOrNull = StdioNull | StdioPipe;

export type TStdIO = StdioOptions | [StdioPipeOrNull, StdioPipeOrNull, StdioPipeOrNull]
export type TextPredicate = (text: string, next: TextPredicate) => boolean
export type ErrorSearch = (text: string, next: ErrorSearch) => string | void | null | false

export interface IRunOptions {
	env?: ProcessEnv,
	timeout?: number,
	notAutoKill?: boolean,
	stdio?: TStdIO,
	shell?: boolean,
	prepareProcess?: (proc: ChildProcess) => void,
}

export interface IGlobalConfig {
	logFilter?: TextPredicate,
	stdOutIsError?: ErrorSearch,
	stdErrIsError?: TextPredicate,
}

export const GLOBAL_CONFIG_ENV = 'RUN_SCRIPT_CONFIG_n20fy652y5n'
