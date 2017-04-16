'use strict'

const WebSocketClient = require('websocket').client
const Promise = require('bluebird')
const handler = require('./handler')

module.exports = user => new Promise((resolve, reject) => {
    let ws = new WebSocketClient()
    ws.connect('ws://pxls.space/ws', null, 'http://pxls.space', { 
        Cookie:  `pxls-token=${user.token}`,
    })
    ws.on('connect', connection => {
        console.log(`CONNECTED TO PXLS WS | ${user.login}`)
        
        connection.on('error', function(error) {
            console.log('Connection error:', e.message, e.stack)
        });
        connection.on('close', function() {
            console.log('Connection Closed')
        });
        
        connection.setPixel = color => (x,y) => {
            connection.send(JSON.stringify({
                type: 'placepixel',
                x, y, color,
	        }))
        }
        
        connection.sendCaptcha = token => {
            connection.send(JSON.stringify({
                type: 'captcha',
                token,
	        }))
        }

        let infoResolve
        connection.info = new Promise((res, rej) => infoResolve = res)

        connection.on('message', message => {
            try {
                if (message.type === 'utf8') {
                    handler(user)(infoResolve)(JSON.parse(message.utf8Data))
                } else {
                    console.log('WARN! Received unknown message: ', message.type)
                }
            } catch (e) {
                console.log('Process data error', e.stack)
            }
        })

        resolve(connection)
    })
})
