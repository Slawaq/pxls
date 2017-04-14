'use strict'

const http = require('http')
const Promise = require('bluebird')
const url = require('url')
const fs = require('fs')

let rand = () => Math.random().toString(36).substr(2)
let loginToken = rand() + rand() + rand()

let defaultHandler = (req, res) => {
    try {
        if (url.parse(req.url, true).query.token === loginToken) {
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

module.exports = (port = 5000) => new Promise((resolve, reject) => {
    let handler = { handle: defaultHandler }
    let server = http.createServer((req, res) => handler.handle(req, res))
    server.listen(port, () => {
        console.log('Server started: ', port)
        console.log('CODE TO INJECT:', `
        (function() {
            var a = document.createElement('script');
            a.src='http://localhost:${port}/?token=${loginToken}';
            a.type='text/javascript';
            document.head.appendChild(a);
        })()
        `)
        resolve(handler)
    })
})
