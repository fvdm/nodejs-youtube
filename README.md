youtube-feeds
=============


Access public YouTube API feeds from your Node.js apps

[![Build Status](https://travis-ci.org/fvdm/nodejs-youtube.svg?branch=master)](https://travis-ci.org/fvdm/nodejs-youtube)


End of life notice
------------------

This module relies heavily on YouTube Data API v2 which will be deprecated on **April 20th 2015**
to be replaced by version 3 of their API. Maintenance will continue on this module until it
stops functioning on the above mentioned date.

It is recommended for all users to switch to a YouTube module with API v3 support.


> See the Wiki for a working example: <https://github.com/fvdm/nodejs-youtube/wiki>


Installation
------------

Stable: `npm install youtube-feeds`

Develop: `npm install fvdm/youtube-feeds#develop`


Usage
-----

```js
// load the module
var youtube = require('youtube-feeds')

// search parkour videos
youtube.feeds.videos( {q: 'parkour'}, console.log )
```


Configuration
-------------

param        | type    | default | description
-------------|---------|---------|------------
httpProtocol | string  | http    | Which HTTP protocol to use
timeout      | integer | 30000   | Request wait timeout in ms
developerKey | string  |         | Your YouTube [developer key](http://code.google.com/apis/youtube/dashboard/)


> `developerKey` is required for some methods, ie. [user.activity](#useractivity).
> You can also temporarily override the global setting with the `key` property in a method's vars.


### Example:

```js
var youtube = require ('youtube-feeds');
youtube.httpProtocol = 'https';
youtube.feeds.videos ({q: 'keywords'}, callback);
```


Callbacks
---------

Each method takes a `callback` function as last parameter. When everything seems alright `err` is null, otherwise `err` will be `instanceof Error` for tracing.

```js
function (err, data) {
	if (err) {
		console.log (err);
	} else {
		console.log (data);
	}
}
```

#### Error Properties

property    | type   | description
------------|--------|----------------------------------
err.message | string | the error message
err.stack   | string | stack trace
err.origin  | string | Context; api, method, request
err.details | mixed  | API response or other information


#### Error Messages

message               | origin  | description
----------------------|---------|------------------------------------------------
invalid response      | api     | API response can't be parsed
not json              | api     | Expected JSON, received something else
not found             | method  | Requested data was not found
not allowed           | method  | No permission to requested data
invalid id            | method  | Requested video ID is invalid
connection closed     | api     | Connection dropped early
connection error      | request | Can't connect to API
request timeout       | request | The request took too long to connect or process
error                 | api     | API returned an error, see err.details
developer key missing | api     | developerKey is not set, see Configuration.


=================================================================================


Feeds
-----

Retrieve lists, search videos, related material.


feeds.videos
------------
### ( [vars], callback )

Get a list of recently published or updated videos, or search them all, filter, sort, etc.

[API docs: custom query parameters](https://developers.google.com/youtube/2.0/developers_guide_protocol_api_query_parameters#Custom_parameters)

```js
youtube.feeds.videos (
	{
		q:              'parkour',
		'max-results':	2,
		orderby:        'published'
	},
	console.log
);
```

Output:

```js
{ updated: '2012-06-18T17:55:11.294Z',
  totalItems: 6985,
  startIndex: 1,
  itemsPerPage: 2,
  items: 
   [ { id: 'WEeqHj3Nj2c',
       uploaded: '2006-06-08T01:17:06.000Z',
       updated: '2012-06-18T15:53:06.000Z',
       uploader: 'sauloca',
       category: 'Sports',
       title: 'Parkour and FreeRunning',
       description: 'Edited by: Saulo Sampson Chase [..]',
       tags: 
        [ 'le',
          'parkour',
          'free',
          'running' ],
       thumbnail: 
        { sqDefault: 'http://i.ytimg.com/vi/WEeqHj3Nj2c/default.jpg',
          hqDefault: 'http://i.ytimg.com/vi/WEeqHj3Nj2c/hqdefault.jpg' },
       player: 
        { default: 'https://www.youtube.com/watch?v=WEeqHj3Nj2c&feature=youtube_gdata_player',
          mobile: 'https://m.youtube.com/details?v=WEeqHj3Nj2c' },
       content: 
        { '1': 'rtsp://v8.cache8.c.youtube.com/CiILENy73wIaGQlnj809HqpHWBMYDSANFEgGUgZ2aWRlb3MM/0/0/0/video.3gp',
          '5': 'https://www.youtube.com/v/WEeqHj3Nj2c?version=3&f=videos&app=youtube_gdata',
          '6': 'rtsp://v8.cache8.c.youtube.com/CiILENy73wIaGQlnj809HqpHWBMYESARFEgGUgZ2aWRlb3MM/0/0/0/video.3gp' },
       duration: 218,
       geoCoordinates: { latitude: -7.100892543792725, longitude: -34.91455078125 },
       rating: 4.862864,
       likeCount: '85314',
       ratingCount: 88343,
       viewCount: 32718590,
       favoriteCount: 99541,
       accessControl: 
        { comment: 'denied',
          commentVote: 'allowed',
          videoRespond: 'moderated',
          rate: 'allowed',
          embed: 'allowed',
          list: 'allowed',
          autoPlay: 'allowed',
          syndicate: 'allowed' } } ] }
```


feeds.related
-------------
### ( videoid, [vars], callback )

Get related videos for a video with **videoid**.


feeds.responses 
---------------
### ( videoid, [vars], callback )

Get videos in response to **videoid**.


feeds.comments
--------------
### ( videoid, [vars], callback )

Get comments to a video. This is still in the original XML-to-JSON format as YouTube does not have JSON-C available for this feed. This may change in future (major) versions of this module.


feeds.standard
--------------
### ( feed, [vars], callback )

Get a standard feed, such as most viewed or top rated videos. Worldwide, local or by subject (or a combination).

[API docs: Standard feeds](https://developers.google.com/youtube/2.0/reference#Standard_feeds)


**Example:** most recent videos worldwide:

```js
youtube.feeds.standard ('most_recent', console.log);
```


**Example:** today's top-rated News videos in the Netherlands:

```js
youtube.feeds.standard ('NL/top_rated_News', {time: 'today'}, console.log);
```


feeds.playlist
--------------
### ( playlistid, [vars], callback )

Get videos on a certain playlist.


=======================================================================


Video
-----

The **video** function provides shorthand methods for one specific video.


video
-----
### ( videoid, [callback] )

Same as [video.details](#videodetails)

```js
youtube.video ('ern37eWDnT0', console.log);
```


video.details
-------------
### ( callback )

Get details for one video.

```js
youtube.video ('ern37eWDnT0').details (console.log);
```


video.related
-------------
### ( [vars], callback )

Get related videos, same as [feeds.related](#feedsrelated).

```js
youtube.video ('ern37eWDnT0').related ({'max-results': 2}, console.log);
```


video.responses
---------------
### ( [vars], callback )

Get videos in response to one video, same as [feeds.responses](#feedsresponses).

```js
youtube.video ('ern37eWDnT0').responses ({'max-results': 2}, console.log);
```


videos.comments
---------------
### ( [vars], callback )

Get comments to a video, same as [feeds.comments](#feedscomments).

```js
youtube.video ('ern37eWDnT0').comments ({'max-results': 2}, console.log);
```


=======================================================================


User
----

Get (public) feed data for one specific user.


user
----
### ( userid, [callback] )

Same as [user.profile](#userprofile).

```js
youtube.user ('user', console.log);
```


user.profile
------------
### ( callback )

Get user profile, in old XML-to-JSON style.

```js
youtube.user ('user').profile (console.log);
```


user.favorites
--------------
### ( [vars], callback )

Get the user's favorite videos. You can optionally filter the results like the other feeds.

```js
youtube.user ('user').favorites (console.log);
```


user.playlists
--------------
### ( [vars], callback )

Get user playlists. Use **[feeds.playlist](#feedsplaylist)** to get the videos.


user.uploads
------------
### ( [vars], callback )

Get the user's uploaded videos.

```js
youtube.user ('user').uploads (console.log);
```


=======================================================================


talk
----
### ( path, [fields], callback, [oldJsonKey] )

Directly talk to the API. This function takes care of connecting and calling the callback only when valid JSON is returned.


Param      | Type     | Description
-----------|----------|------------------------------------------------
path       | string   | full method path without leading slash
fields     | object   | GET parameters
callback   | function | callback function to receive results
oldJsonKey | boolean  | force old XML-to-JSON format instead of clean JSON-C its value is the key containing the expected results


Unlicense / Public Domain
-------------------------

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


Author
------

Franklin van de Meent
| [Website](https://frankl.in)
| [Github](https://github.com/fvdm)
