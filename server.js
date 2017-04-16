'use strict'

const http = require('http')
const Promise = require('bluebird')
const url = require('url')
const fs = require('fs')
const WebSocketServer = require('websocket').server;

let host = 'localhost'
let rand = () => Math.random().toString(36).substr(2)
let loginToken = rand() + rand() + rand()
let isAllowedUrl = reqUrl => url.parse(reqUrl, true).query.token === loginToken

let connections = []

let defaultHandler = (req, res) => {
    try {
        if (isAllowedUrl(req.url)) {
            res.setHeader('Content-Type', 'text/javascript')
            res.setHeader('Access-Control-Allow-Origin', '*')
            fs.createReadStream('./browserClient.js').pipe(res)
        } else {
            res.statusCode = 401
            res.end('<center>401 | Unauthorized</center>')
        }
    } catch (e) {
        res.end(e.stack)
    }
}

module.exports = (port = 5000) => (clientHandler = new Function) => new Promise((resolve, reject) => {
    let handler = { 
        getConnection: () => { connections },
        onconnect: clientHandler
    }
    let server = http.createServer((req, res) => defaultHandler(req, res))
    let wsServer = new WebSocketServer({
        httpServer: server,
        autoAcceptConnections: false
    })

    server.listen(port, () => {
        console.log('Server started: ', port)
        console.log(`Inject this code to http://pxls.space/style.css via chrome devtools:`, `
        (function() {
            var a = document.createElement('script');
            a.id='injectedScript';
            a.src='http://${host}:${port}/?token=${loginToken}';
            a.type='text/javascript';
            document.head.appendChild(a);
        })()
        `)
        resolve(handler)
    })

    wsServer.on('request', function(request) {
        if (!isAllowedUrl(request.httpRequest.url)) {
            request.reject()
            console.log(`${new Date()} | Connection from origin ${request.origin} rejected.`)
            return
        }
        var connection = request.accept();
        console.log((new Date()) + ' Connection accepted.');
        connections.push(connection)
        connection.onmessage = async () => { }
        handler.onconnect(connection)
        connection.on('message', message => {
            try {
                connection
                    .onmessage(JSON.parse(message.utf8Data))
                    .then(new Function)
                    .catch(e => console.log('WS Client error', e.stack))
            } catch (e) {
                console.log('WS Client error', e.stack)
            }
        });
        connection.on('close', function(reasonCode, description) {
            console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
            connections = connections.filter(x => x !== connection)
        });
    });

})
