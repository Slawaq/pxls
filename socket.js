'use strict'

const WebSocketClient = require('websocket').client
const Promise = require('bluebird')

module.exports = token => new Promise((resolve, reject) => {
    let ws = new WebSocketClient()
    ws.connect('ws://pxls.space/ws', null, 'http://pxls.space', { 
        Cookie:  `pxls-token=${token}`,
    })
    ws.on('connect', connection => {
        console.log('CONNECTED')
        
        connection.on('error', function(error) {
            console.log('Connection error:', e.message, e.stack)
        });
        connection.on('close', function() {
            console.log('Connection Closed')
        });
        
        resolve(connection)
    })
})
