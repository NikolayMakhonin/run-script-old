/* eslint-disable no-shadow */
import {run} from '../../../../main/node/helpers'
import {Writable} from 'stream'

describe('node > helpers', function () {
	it('run', async function () {
		let log = ''
		const stdout = new Writable({
			write(chunk: Buffer, encoding: BufferEncoding | 'buffer', callback: (error?: (Error | null)) => void) {
				log += chunk.toString(encoding === 'buffer' ? void 0 : encoding)
			},
		})
		await run('echo 123', {
			stdio: [null, 'pipe', 'inherit'],
			prepareProcess(proc) {
				proc.stdout.pipe(stdout)
			},
		})
		assert.strictEqual(log.trim(), '123')
	})
})
