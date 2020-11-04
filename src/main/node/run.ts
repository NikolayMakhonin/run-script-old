#!/usr/bin/env node

import {GLOBAL_CONFIG_ENV} from './contracts'
/* eslint-disable global-require */
import {run} from './helpers'
import yargs from 'yargs'

const argv = yargs(process.argv)
	.option('config', {
		alias      : 'c',
		type       : 'string',
		description: 'relative path to the run-script-rc.js file',
	})
	.argv

const script = argv._[argv._.length - 1]

module.exports = (async () => {
	try {
		await run(
			`node -e "${script.replace(/"/g, '""')}"`,
			{
				notAutoKill: true,
				stdin      : 'inherit',
				env        : {
					[GLOBAL_CONFIG_ENV]: argv.config || void 0,
				},
			},
		)
	} finally {
		delete process.env[GLOBAL_CONFIG_ENV]
	}
})()
