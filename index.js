'use strict'

const delay = require('delay')
const init = require('./init')
const createSocket = require('./socket')
const clientServer = require('./server')
const clientHandler = require('./clientHandler')
const loadJsonFile = require('load-json-file')

// Whole application stat
let state = { 
	users: []
}

let app = async () => {
	try { 
		Object.assign(state, await loadJsonFile('state.json'))
	} catch (e) {
		console.log('Warning: state is empty')
	}

	// Base things, board, palette etc.
	let base = await init()
	console.log('Base info downloaded')

	for(let user of state.users) {
		try {
			user.connection = await createSocket(user)
		} catch (e) {
			console.log('User init failed token:',  user.token, user.login, '\r\n', e.stack)
		}
	}

	for(let user of state.users) {
		try {
			let info = await Promise.race([
				user.connection.info, 
				new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
			])
			
			user.login = info.name
			user.lastUpdate = new Date
			user.banned = info.banned
			user.banExpiry = info.banExpiry ? new Date(info.banExpiry) : null
		} catch (e) {
			console.log('User info failed token:',  user.token, user.login, '\r\n', e.stack)
		}
	}

	let server = await clientServer(5000)(clientHandler(state))
}

app()
	.then(_ => {})
	.catch(e => console.log('ERROR', e.stack))
