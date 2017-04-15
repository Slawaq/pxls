'use strict'

const writeJsonFile = require('write-json-file')
const delay = require('delay')

let messageHandler = state => connection => async msg => {
    switch(msg.type) {
        case 'users': 
            connection.send(JSON.stringify({ type: 'users', users: state.users }))
            break;
        case 'saveState':
            await writeJsonFile('state.json', state)
            break;
        case 'addUser':
            await delay(5000)
            state.users.push({ token: msg.token, login: 'ESTSD', status: 'UNKNOWN', lastUpdate: new Date })
            connection.send(JSON.stringify({ type: 'userAdded', users: state.users, addedUserToken: msg.token }))
            break;
        case 'removeUser':
            state.users = state.users.filter(x => x.login !== msg.login)
            connection.send(JSON.stringify({ type: 'users', users: state.users }))
            break;
        default:
            console.log('Received unknown type from client: ', msg)
    }
}

module.exports = state => connection => { 
    connection.onmessage = messageHandler(state)(connection)
}
