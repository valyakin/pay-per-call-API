const chai = require('chai')
const expect = chai.expect
const path = require('path')
const { Testkit } = require('aa-testkit')
const { Network, Nodes } = Testkit({
	TESTDATA_DIR: path.join(process.cwd(), 'testdata')
})

class MyNode extends Nodes.CustomNode {
	childPath () {
		return path.join(__dirname, './MyChild')
	}

	hello () {
		console.log('Hello from custom node')
	}

	handleCustomMessage (payload) {
		console.log('CustomMessage!', payload)
		this.emit('pong', payload.data)
	}

	ping () {
		return new Promise(resolve => {
			this.once('pong', (data) => resolve(data))
			this.sendCustomCommand({ type: 'ping' })
		})
	}
}

describe('Check custom node', function () {
	this.timeout(120000)

	before(async () => {
		this.network = await Network.create()
			.with.wallet({ alice: 100e9 })
			.with.wallet({ bob: 100e9 })
			.run()
	})

	it('Test 1', async () => {
		const custom = await this.network.newCustomNode(MyNode).ready()
		custom.hello()
		const data = await custom.ping()
		expect(data).to.be.equal(123)

		const { unit, error } = await this.network.wallet.alice.sendBytes({ toAddress: await this.network.wallet.bob.getAddress(), amount: 50e9 })
		expect(error).to.be.null
		expect(unit).to.be.not.null

		await this.network.witnessUntilStable(unit)
	}).timeout(60000)

	after(async () => {
		await this.network.stop()
	})
})
