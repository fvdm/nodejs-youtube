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

var	https = require('https'),
	EventEmitter = require('events').EventEmitter,
	querystring = require('querystring')

var app = new EventEmitter()


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
		app.talk( 'feeds/api/videos/'+ videoid +'/comments', vars, function( res ) {
			if( res.feed && res.feed.entry ) {
				cb( res.feed.entry )
			}
		}, true )
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
			app.feeds.responses( videoid, vars. cb )
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
			app.talk( 'feeds/api/users/'+ userid, {}, function( res ) {
				if( res.entry ) {
					cb( res.entry )
				}
			}, true )
		}
		
	}
	
}


/////////////////
// COMMUNICATE //
/////////////////

app.talk = function( path, fields, cb, oldJSON ) {
	
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
	fields.alt = oldJSON === true ? 'json' : 'jsonc'
	fields.v = 2
	
	// prepare
	var options = {
		hostname:	'gdata.youtube.com',
		port:		443,
		path:		'/'+ path +'?'+ querystring.stringify( fields ),
		headers: {
			'User-Agent':	'youtube-feeds.js (https://github.com/fvdm/nodejs-youtube)',
			'Accept':	'application/json'
		},
		method:		'GET'
	}
	
	// request
	var request = https.request( options, function( response ) {
		
		// response
		var data = ''
		response.on( 'data', function( chunk ) { data += chunk })
		response.on( 'end', function() {
			
			data = data.toString('utf8').trim()
			
			// validate
			if( data.match( /^(\{.*\}|\[.*\])$/ ) ) {
				
				// ok
				data = JSON.parse( data )
				if( oldJSON ) {
					cb( data )
				} else if( data.data ) {
					cb( data.data )
				}
				
			}
			
		})
		
	})
	
	request.end()
	
}

// ready
module.exports = app
