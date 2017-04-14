'use strict'

const delay = require('delay')
const init = require('./init')
const createSocket = require('./socket')
const handler = require('./handler')
const clientServer = require('./server')

const token = process.argv[2]
console.log('starting with token:', token)

let app = async () => {
	let base = await init(token)
	let socket = await createSocket(token)
	await clientServer(5000)

	socket.on('message', message => {
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
	
	//socket.sendCaptcha('03AOP2lf7TVMGPzrV1ilsvKu4VL7C23afVz_mFTFZGxyKaXd4hc_ehDDUHzvRlOhGvOq-Toi_Y9PZEHic1VhwxJTRKs4R6XQxpiEwxfIerXBg_cRrP3j1diDzqWABZapjmA0KWmrOTFu3Td0Y8lrDJ8th6hDF1V29fyswV5lpYDHnylGr_Ai3uCILWpQmWc1qkT8HM8chODA8c5cX8Vgx3VOYepEHe3vk6i4YjMj7Ec3plLX-Faze7VcTh7HuBcd01lxCvoDdVU4gKxs-N_dDZA-oF1pqOSBH6f5KptUu-6M0CHfY6an5FYpQvWRvVowPZnjnfjnGGUxP6')

	await delay(1000)
	
	//socket.setPixel(5)(411, 1982)

	await delay(5000)
}

app()
	.then(_ => {})
	.catch(e => console.log('ERROR', e.stack))
