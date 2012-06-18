/*
	youtube-data / nodejs-youtube
	
	Node.js module to access YouTube data resources.
	
	This code is released as COPYLEFT, meaning you can do anything
	with it except copyrighting it. If possible it would be nice to
	include the source URL with the code for future reference:
	
	https://github.com/fvdm/nodejs-youtube
*/

var	https = require('https'),
	EventEmitter = require('events').EventEmitter,
	querystring = require('querystring')

var app = new EventEmitter()


///////////
// FEEDS //
///////////

app.feed = {
	
}


/////////////////
// COMMUNICATE //
/////////////////

app.talk = function( type, path, fields, cb ) {
	
	// fix callback
	if( !cb && typeof fields == 'function' ) {
		var cb = fields
		var fields = {}
	}
	
	// fix fields
	if( !fields || typeof fields != 'object' ) {
		var fields = {}
	}
	
	// force JSON
	fields.alt = 'json'
	
	// prepare
	var requestHeaders = {
		'User-Agent':	'youtube-api.js (https://github.com/fvdm/nodejs-youtube)',
		'Accept':		'application/json'
	}
	
	var query = querystring.stringify( fields )
	
	doPost = false
	if( type.match( /(POST|DELETE|PUT)/ ) ) {
		doPost = true
		requestHeaders['Content-Type'] = 'applications/x-www-form-urlencoded'
		requestHeaders['Content-Length'] = query.length
	} else {
		path += '?'+ query
	}
	
	var options = {
		hostname:		'gdata.youtube.com',
		port:			443,
		path:			'/'+ path,
		headers:		requestHeaders,
		method:			type,
		agent:			false
	}
	
	// request
	var request = https.request( options, function( response ) {
		
		// response
		response.setEncoding('utf8')
		var data = ''
		
		response.on( 'data', function( chunk ) { data += chunk })
		response.on( 'end', function() {
			
			// validate
			if( data.length >= 2 && data.substr(0,1) == '{' && data.substr( data.length -1, 1 ) == '}' ) {
				
				// done
				cb( JSON.parse( data ) )
				
			}
			
		})
		
	})
	
	// post & do it
	if( doPost ) {
		request.send( query )
	}
	
	request.end()
	
}

// ready
module.exports = app