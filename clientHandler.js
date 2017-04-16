'use strict'

const writeJsonFile = require('write-json-file')
const delay = require('delay')
const createSocket = require('./socket')

let getUser = async token => {
    let user = { token }
    try {
        let user = { token }
        user.connection = await createSocket(user)
        let info = await Promise.race([
            user.connection.info, 
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ])
			
        user.login = info.name
        user.lastUpdate = new Date
        user.banned = info.banned
        user.banExpiry = info.banExpiry ? new Date(info.banExpiry) : null

        return user
    } catch (e) {
        if (user.connection && typeof(user.connection.close) === 'function')
            user.connection.close()
        return { error: e }
    }
}

let usersWithoutConnection = users => users.map(x => Object.assign({}, x, {connection: null}))

let messageHandler = state => connection => async msg => {
    switch(msg.type) {
        case 'users': 
            connection.send(JSON.stringify({ type: 'users', users: usersWithoutConnection(state.users) }))
            break;
        case 'saveState':
            let dump = Object.assign({ users: usersWithoutConnection(state.users) })
            await writeJsonFile('state.json', dump)
            break;
        case 'addUser':
            if (state.users.some(x => x.token === msg.token)) {
                connection.send(JSON.stringify({ type: 'userAddFailed', addedUserToken: msg.token, errorStack: 'User already added' }))                
                break;
            }

            let user = await getUser(msg.token)
            if (!user.error) {
                state.users.push(user)
                connection.send(JSON.stringify({ type: 'userAdded', users: usersWithoutConnection(state.users), addedUserToken: msg.token }))
            } else {
                connection.send(JSON.stringify({ type: 'userAddFailed', addedUserToken: msg.token, errorStack: user.error.stack }))
            }
            break;
        case 'removeUser':
            let removeUser = state.users.find(x => x.login === msg.login)
            if (removeUser) {
                removeUser.connection.close()
            }
            state.users = state.users.filter(x => x.login !== msg.login)
            connection.send(JSON.stringify({ type: 'users', users: usersWithoutConnection(state.users) }))
            break;
        default:
            console.log('Received unknown type from client: ', msg)
    }
}

module.exports = state => connection => { 
    connection.onmessage = messageHandler(state)(connection)
}
