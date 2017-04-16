'use strict'

let messageHandler = user => infoResolve => data => {
	switch (data.type) {
		case 'pixel': break;
		case 'users': break;
		case 'cooldown':
			user.cooldown = data.wait
		break;
		case 'userinfo': 
			infoResolve(data)
		break;
		case 'captcha_required':
			console.log('NEED CAPTCHA:', data)
		break;
		default:
			console.log('UNKNOWN:', data)
	}
}

module.exports = messageHandler
