'use strict'

const WebSocketClient = require('websocket').client
const fetch = require('node-fetch')

let hexToRgbRegExp = new RegExp(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
let hexToRgb = a => (a = hexToRgbRegExp.exec(a)) ? ({ r: parseInt(a[1], 16), g: parseInt(a[2], 16), b: parseInt(a[3], 16) }) : null
let palette = ["#FFFFFF", "#E4E4E4", "#888888", "#222222", "#FFA7D1", "#E50000", "#E59500", "#A06A42", "#E5D900", "#94E044", "#02BE01", "#00D3DD", "#0083C7", "#0000EA", "#CF6EE4", "#820080"]
	.map((x, i) => ({ hex: x, rgb: hexToRgb(x), color: i }))
	.reduce((r, x) => ({ 
		toHex: Object.assign(r.toHex, { [x.color]: x.hex }),
		toRgb: Object.assign(r.toRgb, { [x.color]: x.rgb }),
	}), { toHex: {}, toRgb: {} })

	
let messageHandler = data => {
	console.log('DATA', data)
}

let ws = new WebSocketClient()
ws.connect('ws://pxls.space/ws', null, { Cookie : ''})
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
	
	connection.send(JSON.stringify({
		type: "placepixel",
		x: a,
		y: c,
		color: b
	}));
})



let getData = async () => {
	let r = await fetch("http://pxls.space/boarddata")
	let board = new Uint32Array(await r.buffer())
	return { color: board, rgb:  }
}

getData().then(() => console.log('GOT DATA')).catch(e => console.log('Get data error: ', e.message, e.stack))


