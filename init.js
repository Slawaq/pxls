'use strict'

const fetch = require('node-fetch')

let getInfo = async token => {
	let r = await fetch("http://pxls.space/info", {
        headers: { 
	        Cookie:  `pxls-token=${token}`,
        }
    })
	return JSON.parse(await r.buffer())
}

let getBoard = async () => {
	let r = await fetch("http://pxls.space/boarddata")
	return await r.buffer()
}

let hexToRgbRegExp = new RegExp(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
let hexToRgb = a => (a = hexToRgbRegExp.exec(a)) ? ({ r: parseInt(a[1], 16), g: parseInt(a[2], 16), b: parseInt(a[3], 16) }) : null
let makePalette = palette => palette
	.map((x, i) => ({ hex: x, rgb: hexToRgb(x), color: i }))
	.reduce((r, x) => ({ 
		toHex: Object.assign(r.toHex, { [x.color]: x.hex }),
		toRgb: Object.assign(r.toRgb, { [x.color]: x.rgb }),
	}), { toHex: {}, toRgb: {} })

module.exports = async token => {
    let info = await getInfo(token)
    let palette = makePalette(info.palette)
    let board = await getBoard()

    return { info, palette, board, getBoard  }
}
