let token = document.getElementById('injectedScript').src.split("=")[1]
console.log('injected with token', token)
document.body.innerHTML = ''

let handler = msg => {
    switch(msg.type) {
        case 'users':
            setUsers(msg.users)
            break;
        case 'userAdded':
            setUsers(msg.users)
            hideAddingStatus(msg.addedUserToken)
            break;
        case 'userAddFailed':
            setAddingErrorStatus(msg.addedUserToken)(msg.errorStack)
            break;
        default:
            console.log('Received unknown type from server: ', msg)
    }
}

let ws = new WebSocket(document.getElementById('injectedScript').src.replace('http', 'ws'));
ws.onopen = () => {
    initStyles()
    initStatusTable()
    initGCaptcha()
    initControls()
    initAddForm()

    ws.send(JSON.stringify({ type: 'users' }))
}
ws.onclose = () => document.body.innerHTML = '<center style="color: red">CONNECTION CLOSED</center>'
ws.onmessage = m => {
    try {
        handler(JSON.parse(m.data))
    } catch (e) {
        console.log('Handle error', m, '\r\n', e.stack)
    }
}

let dump = () => ws.send(JSON.stringify({ type: 'saveState' }))
let addUser = event => { 
    let token = document.getElementById('form-token').value
    ws.send(JSON.stringify({ type: 'addUser', token }))
    event.stopPropagation()
    document.getElementById('form-token').value = ''
    hideAddForm()
    showUserAddingStatus(token)
    return false;
}
let removeUser = login => ws.send(JSON.stringify({ type: 'removeUser', login }))

window.captchaWaiter = new Function
let getCaptcha = cb => {
    grecaptcha.reset()
    grecaptcha.execute()
    captchaWaiter = token => {
        cb(token)
        captchaWaiter = new Function
    }
}

let initGCaptcha = () => {
    let n = document.createElement('div')
    n.className='g-recaptcha'
    n.dataset.sitekey='6LcXjRsUAAAAAKeMTmvc090tFfxO15eQN23VE-go'
    n.dataset.callback='captchaWaiter'
    n.dataset.size='invisible'
    document.body.appendChild(n)
    var sc = document.createElement('script')
    sc.src = 'https://www.google.com/recaptcha/api.js'
    document.head.appendChild(sc)
}

let initStatusTable = () => {
    let n = document.createElement('table')
    n.className='users'
    n.innerHTML = `
<tr>
    <td width="100">login</td>
    <td width="400">token</td>
    <td width="200">status</td>
    <td width="200">actions</td>
</tr>
    `
    document.body.insertBefore(n, document.body.firstChild)
}

let setUsers = users => {
    document.getElementsByClassName('users')[0].remove()
    initStatusTable()
    for(let { login, token, status } of users) {
        let nu = document.createElement('tr')
        nu.innerHTML = `
            <td>${login}</td>
            <td>${token}</td>
            <td>${status}</td>
            <td><a href="javascript: removeUser('${login}')">[X]</a></td>
        `
        document.getElementsByClassName('users')[0].appendChild(nu)
    }
}

let showUserAddingStatus = token => {
    let c = document.createElement('div')
    c.className = token
    c.innerHTML = `
        <p style="color: cornflowerblue;">User with token <b>${token}</b> is adding!</p>
    `
    document.body.appendChild(c)
} 

let hideAddingStatus = token => {
    for(let e of document.getElementsByClassName(token))
        e.remove()
} 

let setAddingErrorStatus = token => error => {
    for(let e of document.getElementsByClassName(token))
        e.innerHTML = `
        <pre style="color: red;">User adding with token <b>${token}</b> is failed!
        ${error}
        </pre><a href='javascript: hideAddingStatus("${token}")'>[X]</a>
    `
} 

let initControls = () => {
    let c = document.createElement('div')
    c.className = 'controls'
    c.innerHTML = `
        <input type='button' id='showForm' value='add' onclick='showAddForm()' />
        <input type='button' value='dump' onclick='dump()' />
    `

    document.body.appendChild(c)
}

let initAddForm = () => {
    let f = document.createElement('form')
    f.className = 'userForm'
    f.onsubmit = addUser
    f.innerHTML = `
        <input type='text' id='form-token' value='' placeholder='user token from cookie' />
    `
    document.body.appendChild(f)
    hideAddForm()
}

let showAddForm = () => {
    document.getElementById('showForm').style.display = 'none'
    document.getElementsByClassName('userForm')[0].style.display = 'inline-block'
}

let hideAddForm = () => {
    document.getElementById('showForm').style.display = 'inline-block'
    document.getElementsByClassName('userForm')[0].style.display = 'none'
}

let initStyles = () => {
    let s = document.createElement('style')
    s.innerHTML = `
<style>

    body { width: 100%; margin: 0; float: none; }
    body { background: white; }
    body { color: #111; }
    body { font-family: sans-serif; }
    body { font-size: 12pt; } 
    input { font-size: 12pt; margin: 5px; } 
    a:link { cursor: pointer; text-decoration: underline; color: #06c; }

    .users {
        margin: 10px;
        width: 700px;
        display: inline-block;
    }

    td {
        padding-top: 15px;
    }

</style>
`
    document.head.appendChild(s)
}