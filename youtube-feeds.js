/*
Name:         youtube-feeds
Description:  Node.js module to access public YouTube data feeds.
Source:       https://github.com/fvdm/nodejs-youtube
Feedback:     https://github.com/fvdm/nodejs-youtube/issues
License:      Unlicense / Public Domain
              (see UNLICENSE file)
*/

var xml2json = require ('node-xml2json');
var querystring = require ('querystring');

var app = {
  httpProtocol: 'http',  // http, https
  timeout: 5000,         // max execution time in milliseconds
  developerKey: null     // YouTube developer key
};


///////////
// FEEDS //
///////////

app.feeds = {
  // Videos
  videos: function (vars, cb) {
    app.talk ('feeds/api/videos', vars, cb);
  },

  // Related videos
  related: function (videoid, vars, cb) {
    app.talk ('feeds/api/videos/'+ videoid +'/related', vars, cb);
  },

  // Responses
  responses: function (videoid, vars, cb) {
    app.talk ('feeds/api/videos/'+ videoid +'/responses', vars, cb);
  },

  // Comments
  comments: function (videoid, vars, cb) {
    app.talk ('feeds/api/videos/'+ videoid +'/comments', vars, cb, 'feed');
  },

  // Standard feed
  // https://developers.google.com/youtube/2.0/reference#Standard_feeds
  // feeds.standard ('most_recent', console.log)
  // feeds.standard ('NL/top_rated_News', {time: 'today'}, console.log)
  standard: function (feed, vars, cb) {
    app.talk ('feeds/api/standardfeeds/'+ feed, vars, cb);
  },

  // Playlist
  playlist: function (playlistid, vars, cb) {
    app.talk ('feeds/api/playlists/'+ playlistid, vars, cb);
  }
};


///////////
// VIDEO //
///////////

app.video = function (videoid, cb) {
  if (typeof cb === 'function') {
    app.talk ('feeds/api/videos/'+ videoid, cb);
  }

  // video shortcuts
  return {
    details: function (cb) {
      app.video (videoid, cb);
    },

    related: function (vars, cb) {
      app.feeds.related (videoid, vars, cb);
    },

    responses: function (vars, cb) {
      app.feeds.responses (videoid, vars, cb);
    },

    comments: function (vars, cb) {
      app.feeds.comments (videoid, vars, cb);
    }
  };
};


//////////
// USER //
//////////

// User
app.user = function (userid, cb) {
  if (cb && typeof cb === 'function') {
    app.user (userid).profile (cb);
  }

  return {
    // Favorites
    favorites: function (vars, cb) {
      app.talk ('feeds/api/users/'+ userid +'/favorites', vars, cb);
    },

    // Playlists
    playlists: function (vars, cb) {
      app.talk ('feeds/api/users/'+ userid +'/playlists', vars, cb);
    },

    // Profile
    profile: function (cb) {
      app.talk ('feeds/api/users/'+ userid, {}, cb, 'entry');
    },

    // Uploads
    uploads: function (vars, cb) {
      app.talk ('feeds/api/users/'+ userid +'/uploads', vars, cb);
    },

    // New subscription videos
    newsubscriptionvideos: function (vars, cb) {
      app.talk ('feeds/api/users/'+ userid +'/newsubscriptionvideos', vars, cb);
    }
  };
};


/////////////////
// COMMUNICATE //
/////////////////

app.talk = function (path, fields, cb, oldJsonKey) {
  var complete = false;

  // fix callback
  if (!cb && typeof fields === 'function') {
    cb = fields;
    fields = {};
  }

  // fix fields
  if (!fields || typeof fields !== 'object') {
    fields = {};
  }

  // force JSON-C and version
  fields.alt = oldJsonKey ? 'json' : 'jsonc';
  fields.v = 2;

  // prepare
  var options = {
    hostname: 'gdata.youtube.com',
    path: '/'+ path +'?'+ querystring.stringify (fields),
    headers: {
      'User-Agent': 'youtube-feeds.js (https://github.com/fvdm/nodejs-youtube)',
      'Accept': 'application/json',
      'GData-Version': '2'
    },
    method: 'GET'
  };

  // use X-GData-Key instead of adding it to the url, as per http://goo.gl/HEiCj
  // basically more secure in headers than in query string
  if (fields.key || app.developerKey) {
    options.headers['X-GData-Key'] = 'key=' + (fields.key || app.developerKey);
    delete fields.key;
  }

  var http = require ('http');
  if (app.httpProtocol === 'https') {
    http = require ('https');
  }

  var request = http.request (options);

  // response
  request.on ('response', function (response) {
    var data = [];
    var size = 0;

    response.on ('data', function (chunk) {
      data.push (chunk);
      size += chunk.length;
    });

    response.on ('end', function () {

      if (complete) {
        return;
      } else {
        complete = true;
      }

      // process buffer and clear mem
      data = new Buffer.concat (data, size).toString ('utf8').trim ();
      var error = null;

      // validate
      if (data.match (/^(\{.*\}|\[.*\])$/)) {
        // ok
        data = JSON.parse (data);

        if (data.data) {
          data = data.data;
        } else if (data.error) {
          complete = true;
          error = new Error ('error');
          error.origin = 'api';
          error.details = data.error;
        } else if (oldJsonKey) {
          if (!data[oldJsonKey]) {
            complete = true;
            error = new Error ('invalid response');
            error.origin = 'api';
          } else {
            data = data[oldJsonKey];
          }
        }
      } else if (data.match (/^<errors .+<\/errors>$/) || data.match (/^<\?xml version.+<\/errors>$/)) {
        data = xml2json.parser (data);

        // fix for JSONC compatibility
        complete = true;
        error = new Error ('error');
        error.origin = 'api';
        error.details = data.errors.error ? [data.errors.error] : data.errors;

        error.details.forEach (function (err, errk) {
          if (err.internalreason) {
            error.details[errk].internalReason = err.internalreason;
            delete error.details[errk].internalreason;
          }
        });
      } else if (data.match (/<H2>Error /)) {
        // html error response
        complete = true;
        error = new Error ('error');
        data.replace (/<H1>([^<]+)<\/H1>\n<H2>Error (\d+)<\/H2>/, function (s, reason, code) {
          error.origin = 'api';
          error.details = {
            internalReason: reason,
            code: code
          };
        });
      } else {
        // not json
        complete = true;
        error = new Error ('not json');
        error.origin = 'api';
      }

      // parse error
      if (error && error.origin === 'api' && error.message === 'error') {
        var errorDetails = error.details;
        if (error.details[0] && error.details[0].code && error.details[0].code === 'ResourceNotFoundException') {
          complete = true;
          error = new Error ('not found');
          error.origin = 'method';
          error.details = errorDetails;
        } else if (error.details.code === 403) {
          complete = true;
          error = new Error ('not allowed');
          error.origin = 'method';
          error.details = errorDetails;
        } else if (error.details.message === 'Invalid id') {
          complete = true;
          error = new Error ('invalid id');
          error.origin = 'method';
          error.details = errorDetails;
        } else if (error.details[0] && error.details[0].internalReason === 'Developer key required for this operation') {
          complete = true;
          error = new Error ('developer key missing');
          error.origin = 'api';
          error.details = errorDetails;
        }
      }

      // parse response
      if (typeof data.totalItems !== 'undefined' && data.totalItems === 0) {
        complete = true;
        error = new Error ('not found');
        error.origin = 'method';
      } else if (data.feed && data.feed.openSearch$totalResults && data.feed.openSearch$totalResults.$t && data.feed.openSearch$totalResults.$t === 0) {
        complete = true;
        error = new Error ('not found');
        error.origin = 'method';
      }

      // do callback
      cb (error, data);
    });

    // early disconnect
    response.on ('close', function () {
      if (!complete) {
        complete = true;
        var err = new Error ('connection closed');
        err.origin = 'api';
        cb (err);
      }
    });
  });

  // no endless waiting
  request.setTimeout (parseInt (app.timeout), function () {
    if (!complete) {
      complete = true;
      var err = new Error ('request timeout');
      err.origin = 'request';
      cb (err);
      request.destroy ();
    }
  });

  // connection error
  request.on ('error', function (error) {
    if (!complete) {
      complete = true;
      var err = new Error ('connection error');
      err.origin = 'request';
      err.details = error;
      cb (err);
    }
  });

  // perform and finish request
  request.end();
};

// ready
module.exports = app;
