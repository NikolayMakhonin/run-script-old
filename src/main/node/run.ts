#!/usr/bin/env node

/* eslint-disable global-require */
import {run, setGlobalConfig, getGlobalConfig} from './helpers'
import yargs from 'yargs'
import path from 'path'
import fs from 'fs'

const argv = yargs(process.argv)
	.option('config', {
		alias      : 'c',
		type       : 'string',
		description: 'relative path to the run-script-rc.js file',
	})
	.argv

const configFile = path.resolve(process.cwd(), argv.config || '.run-script-rc.js')
const script = argv._[argv._.length - 1]

if (fs.existsSync(configFile)) {
	const config = require(configFile)
	setGlobalConfig({
		...getGlobalConfig(),
		...config,
	})
} else if (argv.config) {
	throw new Error('Config file not found: ' + configFile)
}

module.exports = run(
	`node -e "${script.replace(/"/g, '""')}"`,
	{
		notAutoKill: true,
		stdio      : 'inherit',
	},
)
