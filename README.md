# nodejs-youtube

Access public YouTube API feeds from your Node.js apps

## Installation

```
npm install youtube-feeds
```

## Usage

```js
// load the module
var youtube = require('youtube-feeds')

// search parkour videos
youtube.feeds.videos( {q: 'parkour'}, console.log )
```

# Feeds

## feeds.videos
**( [vars,] callback )**

Get a list of recently published or updated videos, or search them all, filter, sort, etc.

[API docs: custom query parameters](https://developers.google.com/youtube/2.0/developers_guide_protocol_api_query_parameters#Custom_parameters)

```js
youtube.feeds.videos(
	{
		q: 				'parkour',
		'max-results':	2,
		orderby:		'published'
	},
	console.log
)
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
          syndicate: 'allowed' } },
     { id: 'cNvJy0zoXOY',
       uploaded: '2010-05-01T02:21:25.000Z',
       updated: '2012-06-18T16:24:52.000Z',
       uploader: 'damienwalters',
       category: 'Sports',
       title: 'Damien Walters 2010',
       description: 'Training and new things [..]',
       tags: 
        [ 'Tumbling',
          'Gymnastics',
          'Freerunning',
          'Stunts' ],
       thumbnail: 
        { sqDefault: 'http://i.ytimg.com/vi/cNvJy0zoXOY/default.jpg',
          hqDefault: 'http://i.ytimg.com/vi/cNvJy0zoXOY/hqdefault.jpg' },
       player: 
        { default: 'https://www.youtube.com/watch?v=cNvJy0zoXOY&feature=youtube_gdata_player',
          mobile: 'https://m.youtube.com/details?v=cNvJy0zoXOY' },
       content: 
        { '1': 'rtsp://v7.cache7.c.youtube.com/CiILENy73wIaGQnmXOhMy8nbcBMYDSANFEgGUgZ2aWRlb3MM/0/0/0/video.3gp',
          '5': 'https://www.youtube.com/v/cNvJy0zoXOY?version=3&f=videos&app=youtube_gdata',
          '6': 'rtsp://v3.cache5.c.youtube.com/CiILENy73wIaGQnmXOhMy8nbcBMYESARFEgGUgZ2aWRlb3MM/0/0/0/video.3gp' },
       duration: 164,
       aspectRatio: 'widescreen',
       recorded: '2010-06-29',
       location: 'england',
       rating: 4.969567,
       likeCount: '94337',
       ratingCount: 95060,
       viewCount: 18004468,
       favoriteCount: 107421,
       commentCount: 31015,
       accessControl: 
        { comment: 'allowed',
          commentVote: 'allowed',
          videoRespond: 'moderated',
          rate: 'allowed',
          embed: 'allowed',
          list: 'allowed',
          autoPlay: 'allowed',
          syndicate: 'allowed' } } ] }
```

## feeds.related
**( videoid, [vars,] callback )**

Get related videos for a video with **videoid**.

## feeds.responses 
**( videoid, [vars,] callback )**

Get videos in response to **videoid**.

## feeds.comments
**( videoid, [vars,] callback )**

Get comments to a video. This is still in the original XML-to-JSON format as YouTube does not have JSON-C available for this feed. This may change in future (major) versions of this module.

## feeds.standard
**( feed, [vars,] callback )**

Get a standard feed, such as most viewed or top rated videos. Worldwide, local or by subject (or a combination).

[API docs: Standard feeds](https://developers.google.com/youtube/2.0/reference#Standard_feeds)

**Example:** most recent videos worldwide:

```js
youtube.feeds.standard( 'most_recent', console.log )
```

**Example:** today's top-rated News videos in the Netherlands:

```js
youtube.feeds.standard( 'NL/top_rated_News', {time: 'today'}, console.log )
```

## feeds.playlist
**( playlistid, [vars,] callback )**

Get videos on a certain playlist.

# Video

The **video** function provides shorthand methods for one specific video.

## video
**( videoid [, callback] )**

Same as video.details

```js
youtube.video( 'ern37eWDnT0', console.log )
```

## video.details
**( callback )**

Get details for one video.

```js
youtube.video( 'ern37eWDnT0' ).details( console.log )
```

## video.related
**( [vars,] callback )**

Get related videos, same as **feeds.related**.

```js
youtube.video( 'ern37eWDnT0' ).related( {'max-results': 2}, console.log )
```

## video.responses

**( [vars,] callback )**

Get videos in response to one video, same as **feeds.responses**.

```js
youtube.video( 'ern37eWDnT0' ).responses( {'max-results': 2}, console.log )
```

## videos.comments

**( [vars,] callback )**

Get comments to a video, same as **feeds.comments**.

```js
youtube.video( 'ern37eWDnT0' ).comments( {'max-results': 2}, console.log )
```

# User

Get (public) feed data for one specific user.

## user
**( userid [, callback] )**

Same as user.profile

```js
youtube.user( 'unknowntitle', console.log )
```

## user.profile
**( callback )**

Get user profile, in old XML-to-JSON style.

```js
youtube.user( 'unknowntitle' ).profile( console.log )
```

## user.favorites
**( [vars,] callback )**

Get the user's favorite videos. You can optionally filter the results like the other feeds.

```js
youtube.user( 'unknowntitle' ).favorites( console.log )
```

## user.playlists
**( [vars,] callback )**

Get user playlists. Use **feeds.playlist** to get the videos.

# Communication

## talk
**( path [, fields] callback [, oldJSON] )**

Directly talk to the API. This function takes care of connecting and calling the callback only when valid JSON is returned.

* **path** - string - full method path without leading slash
* **fields** - object - GET parameters
* **callback** - function - callback function to receive results
* **oldJSON** - force old XML-to-JSON format instead of clean JSON-C

# License

This module is **COPYLEFT** meaning you can do with it anything you want except copyrighting it. If possible it would be nice to include the source URL along with the code: https://github.com/fvdm/nodejs-youtube