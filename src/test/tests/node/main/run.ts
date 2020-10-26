/* eslint-disable no-shadow,global-require */
import {run} from '../../../../main/node/helpers'
import {Writable} from 'stream'

describe('node > run', function () {
	it('require', async function () {
		process.argv = ['node', './index.js', '--config', '.run-script-rc.js', 'console.log(123)']
		await require('../../../../main/node/run')
	})
})
