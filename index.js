'use strict'

const delay = require('delay')
const init = require('./init')
const socket = require('./socket')
const handler = require('./handler')

const token = process.argv[2]
console.log('starting with token:', token)

let app = async () => {
	let base = await init(token)
	let server = await socket(token)

	server.on('message', message => {
		try {
			if (message.type === 'utf8') {
				handler(JSON.parse(message.utf8Data))(base)
			} else {
				console.log('WARN! Received unknown message: ', message.type)
			}
		} catch (e) {
			console.log('Process data error', e.stack)
		}
	})
	
	server.send(JSON.stringify({
		type: "placepixel",
		x: 420,
		y: 1990,
		color: 5,
	}))
}

app()
	.then(_ => {})
	.catch(e => console.log('ERROR', e.stack))
