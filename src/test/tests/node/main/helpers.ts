/* eslint-disable no-shadow */
import {run} from '../../../../main/node/helpers'
import {Writable} from 'stream'

describe('node > helpers', function () {
	this.timeout(20000)

	it('run', async function () {
		let log = ''
		const stdout = new Writable({
			write(chunk: Buffer, encoding: BufferEncoding | 'buffer', callback: (error?: (Error | null)) => void) {
				log += chunk.toString(encoding === 'buffer' ? void 0 : encoding)
			},
		})
		const result = await run('echo 123', {
			prepareProcess(proc) {
				proc.stdout.pipe(stdout)
			},
		})
		assert.strictEqual(result.trim(), '123')
		assert.strictEqual(log.trim(), '123')
	})
})
