const path = require('path')
const CustomNodeChild = require('aa-testkit/src/nodes/CustomNode/child')

class MyNodeChild extends CustomNodeChild {
	run () {
		const { Server, Client } = require(path.join(__dirname, '../api'))
		console.log('Server', Server)
		this.Server = Server
		this.Client = Client

		this.payPerCallServer = new Server(1)
	}

	handleCustomCommand (payload) {
		console.log('CustomCommand!', payload)
		this.sendCustomMessage({ type: 'pong', data: 123 })
	}
}

const child = new MyNodeChild(process.argv)
child.start()
