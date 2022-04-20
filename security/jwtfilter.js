const ejwt = require('express-jwt');
const config = require('../config/appconfig')

module.exports = jwtFilter

function jwtFilter() {
	let secret = config.secret;
	return ejwt({secret, algorithms: ['HS256']}).unless({
		path: ['/auth','/valideToken','/recoverPass','/']
	});
}