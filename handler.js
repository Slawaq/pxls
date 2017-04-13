'use strict'

let messageHandler = data => base => {
	switch (data.type) {
		case 'pixel': break;
		case 'users': break;
		case 'captcha_required':
			console.log('NEED CAPTCHA:', data)
			console.log('captcha key:', base.info.captchaKey)
			console.log('captcha injection code:', `
            (() => { a = document.createElement("div"),a.className="g-recaptcha",a.dataset.size="invisible",a.dataset.sitekey="6LcXjRsUAAAAAKeMTmvc090tFfxO15eQN23VE-go",a.dataset.callback="dno",document.body.appendChild(a),a = document.createElement("script"),a.src = "https://www.google.com/recaptcha/api.js",document.head.appendChild(a)})()`)
		default:
			console.log('UNKNOWN:', data)
	}
}

module.exports = messageHandler
