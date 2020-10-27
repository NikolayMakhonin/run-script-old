/* eslint-disable no-shadow,global-require */
import {run} from '../../../../main/node/helpers'
import {Writable} from 'stream'
// @ts-ignore
import pkg from '~/package.json'

describe('node > run', function () {
	this.timeout(20000)

	it('require', async function () {
		pkg.name = 'path'
		process.argv = ['node', './index.js', '--config', '.run-script-rc.js', 'console.log(123)']
		await require('../../../../main/node/run')
	})
})
