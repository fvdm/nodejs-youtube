/*
Name:         youtube-feeds
Description:  Node.js module to access public YouTube data feeds.
Source:       https://github.com/fvdm/nodejs-youtube
Feedback:     https://github.com/fvdm/nodejs-youtube/issues
License:      Unlicense / Public Domain

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org>
*/

var http = require('http'),
    xml2json = require('node-xml2json'),
    querystring = require('querystring')

var app = {}


///////////
// FEEDS //
///////////

app.feeds = {
	
	// Videos
	videos: function( vars, cb ) {
		if( !cb && typeof vars == 'function' ) {
			var cb = vars
			var vars = {}
		}
		app.talk( 'feeds/api/videos', vars, cb )
	},
	
	// Related videos
	related: function( videoid, vars, cb ) {
		if( !cb && typeof vars == 'function' ) {
			var cb = vars
			var vars = {}
		}
		app.talk( 'feeds/api/videos/'+ videoid +'/related', vars, cb )
	},
	
	// Responses
	responses: function( videoid, vars, cb ) {
		if( !cb && typeof vars == 'function' ) {
			var cb = vars
			var vars = {}
		}
		app.talk( 'feeds/api/videos/'+ videoid +'/responses', vars, cb )
	},
	
	// Comments
	comments: function( videoid, vars, cb ) {
		if( !cb && typeof vars == 'function' ) {
			var cb = vars
			var vars = {}
		}
		app.talk( 'feeds/api/videos/'+ videoid +'/comments', vars, cb, 'feed' )
	},
	
	// Standard feed
	// https://developers.google.com/youtube/2.0/reference#Standard_feeds
	// feeds.standard( 'most_recent', console.log )
	// feeds.standard( 'NL/top_rated_News', {time: 'today'}, console.log )
	standard: function( feed, vars, cb ) {
		if( !cb && typeof vars == 'function' ) {
			var cb = vars
			var vars = {}
		}
		app.talk( 'feeds/api/standardfeeds/'+ feed, vars, cb )
	},
	
	// Playlist
	playlist: function( playlistid, vars, cb ) {
		if( !cb && typeof vars == 'function' ) {
			var cb = vars
			var vars = {}
		}
		app.talk( 'feeds/api/playlists/'+ playlistid, vars, cb )
	}
	
}


///////////
// VIDEO //
///////////

app.video = function( videoid, cb ) {
	
	if( typeof cb == 'function' ) {
		app.talk( 'feeds/api/videos/'+ videoid, cb )
	}
	
	// video shortcuts
	return {
		
		details: function( cb ) {
			app.video( videoid, cb )
		},
		
		related: function( vars, cb ) {
			if( !cb && typeof vars == 'function' ) {
				var cb = vars
				var vars = {}
			}
			app.feeds.related( videoid, vars, cb )
		},
		
		responses: function( vars, cb ) {
			if( !cb && typeof vars == 'function' ) {
				var cb = vars
				var vars = {}
			}
			app.feeds.responses( videoid, vars, cb )
		},
		
		comments: function( vars, cb ) {
			if( !cb && typeof vars == 'function' ) {
				var cb = vars
				var vars = {}
			}
			app.feeds.comments( videoid, vars, cb )
		}
		
	}
	
}


//////////
// USER //
//////////
	
// User
app.user = function( userid, cb ) {
	
	if( cb && typeof cb == 'function' ) {
		app.user( userid ).profile( cb )
	}
	
	return {
		
		// Favorites
		favorites: function( vars, cb ) {
			if( !cb && typeof vars == 'function' ) {
				var cb = vars
				var vars = {}
			}
			app.talk( 'feeds/api/users/'+ userid +'/favorites', vars, cb )
		},
		
		// Playlists
		playlists: function( vars, cb ) {
			if( !cb && typeof vars == 'function' ) {
				var cb = vars
				var vars = {}
			}
			app.talk( 'feeds/api/users/'+ userid +'/playlists', vars, cb )
		},
		
		// Profile
		profile: function( cb ) {
			app.talk( 'feeds/api/users/'+ userid, {}, cb, 'entry' )
		},
		
		// Uploads
		uploads: function( vars, cb ) {
			app.talk( 'feeds/api/users/'+ userid +'/uploads', vars, cb)
		}
		
	}
	
}


/////////////////
// COMMUNICATE //
/////////////////

// close connection when not done within N milliseconds
app.timeout = 30000

app.talk = function( path, fields, cb, oldJsonKey ) {
	
	// fix callback
	if( !cb && typeof fields == 'function' ) {
		var cb = fields
		var fields = {}
	}
	
	// fix fields
	if( !fields || typeof fields != 'object' ) {
		var fields = {}
	}
	
	// force JSON-C and version
	fields.alt = oldJsonKey !== undefined ? 'json' : 'jsonc'
	fields.v = 2
	
	// prepare
	var options = {
		hostname:	'gdata.youtube.com',
		port:		80,
		path:		'/'+ path +'?'+ querystring.stringify( fields ),
		headers: {
			'User-Agent':	'youtube-feeds.js (https://github.com/fvdm/nodejs-youtube)',
			'Accept':	'application/json'
		},
		method:		'GET'
	}
	
	// request
	var request = http.request( options, function( response ) {
		
		// response
		var data = ''
		response.on( 'data', function( chunk ) { data += chunk })
		response.on( 'end', function() {
			
			data = data.toString('utf8').trim()
			var error = null
			
			// validate
			if( data.match( /^(\{.*\}|\[.*\])$/ ) ) {
				
				// ok
				data = JSON.parse( data )
				
				if( data.data !== undefined ) {
					data = data.data
				} else if( data.error !== undefined ) {
					error = new Error('error')
					error.origin = 'api'
					error.details = data.error
				} else if( oldJsonKey !== undefined ) {
					if( data[ oldJsonKey ] === undefined ) {
						error = new Error('invalid response')
						error.origin = 'api'
					} else {
						data = data[ oldJsonKey ]
					}
				}
				
			} else if( data.match( /^<errors .+<\/errors>$/ ) ) {
				
				// xml error response
				data = xml2json.parser( data )
				
				// fix for JSONC compatibility
				error = new Error('error')
				error.origin = 'api'
				error.details = data.errors.error !== undefined ? [data.errors.error] : data.errors
				
				error.details.forEach( function( err, errk ) {
					if( err.internalreason !== undefined ) {
						error.details[ errk ].internalReason = err.internalreason
						delete error.details[ errk ].internalreason
					}
				})
				
			} else {
				
				// not json
				error = new Error('not json')
				error.origin = 'api'
				
			}
			
			// parse error
			if( error && error.origin == 'api' && error.message == 'error' ) {
				var errorDetails = error.details
				if(
					error.details[0] !== undefined
					&& error.details[0].code !== undefined
					&& error.details[0].code == 'ResourceNotFoundException'
				) {
					error = new Error('not found')
					error.origin = 'method'
					error.details = errorDetails
				} else if( error.details.code == 403 ) {
					error = new Error('not allowed')
					error.origin = 'method'
					error.details = errorDetails
				} else if( error.details.message == 'Invalid id' ) {
					error = new Error('invalid id')
					error.origin = 'method'
					error.details = errorDetails
				}
			}
			
			// parse response
			if( data.totalItems !== undefined && data.totalItems == 0 ) {
				error = new Error('not found')
				error.origin = 'method'
			} else if(
				data.feed !== undefined
				&& data.feed['openSearch$totalResults'] !== undefined
				&& data.feed['openSearch$totalResults']['$t'] !== undefined
				&& data.feed['openSearch$totalResults']['$t'] == 0
			) {
				error = new Error('not found')
				error.origin = 'method'
			}
			
			// do callback
			cb( error, data )
			
		})
		
		// early disconnect
		response.on( 'close', function() {
			var err = new Error( 'connection closed' )
			err.origin = 'api'
			cb( err )
		})
		
	})
	
	// no endless waiting
	request.setTimeout( app.timeout, function() {
		request.destroy()
	})
	
	// connection error
	request.on( 'error', function( error ) {
		var err = new Error( 'connection error' )
		err.origin = 'request'
		err.details = error
		cb( err )
	})
	
	// perform and finish request
	request.end()
	
}

// ready
module.exports = app
