#!/usr/bin/env node

import {GLOBAL_CONFIG_ENV} from './contracts'
/* eslint-disable global-require */
import {run} from './helpers'
import yargs from 'yargs'
// @ts-ignore
import pkg from '~/package.json'

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
			`node -e "require('${pkg.name}'); ${script.replace(/"/g, '""')}"`,
			{
				notAutoKill: true,
				stdio      : 'inherit',
				env        : {
					[GLOBAL_CONFIG_ENV]: argv.config || void 0,
				},
			},
		)
	} finally {
		delete process.env[GLOBAL_CONFIG_ENV]
	}
})()
