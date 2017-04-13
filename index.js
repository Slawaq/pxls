'use strict'

const WebSocketClient = require('websocket').client
const fetch = require('node-fetch')

let ws = new WebSocketClient()
let messageHandler = data => {
	console.log('DATA', data)
}
ws.connect('ws://pxls.space/ws', null, { Cookie : 'pxls-token=GaXuDPQoYbKpowiGesYWsYJUkrJUAvqtm'})

ws.on('connect', connection => {
	console.log('CONNECTED')
	
	connection.on('error', function(error) {
		console.log('Connection error:', e.message, e.stack)
    });
    connection.on('close', function() {
        console.log('Connection Closed')
    });
	
	connection.on('message', message => {
		try {
			if (message.type === 'utf8') {
				messageHandler(message.utf8Data)
			} else {
				console.log('WARN! Received unknown message: ', message.type)
			}
		} catch (e) {
			console.log('Process data error', e.message, e.stack)
		}
	})
})



let getData = async () => {
	let r = await fetch("http://pxls.space/boarddata")
	console.log(r)
}

getData().then(() => console.log('GOT DATA')).catch(e => console.log('Get data error: ', e.message, e.stack))


