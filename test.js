/*
Name:         youtube-feeds
Description:  Test script for youtube-feeds.js
Source:       https://github.com/fvdm/nodejs-youtube
Feedback:     https://github.com/fvdm/nodejs-youtube/issues
License:      Public Domain / Unlicense (see UNLICENSE file)
*/

var util = require ('util');

// Setup
var app = require ('./');
app.httpProtocol = process.env.YOUTUBE_PROTOCOL || 'http';
app.timeout = process.env.YOUTUBE_TIMEOUT || 5000;
app.developerKey = process.env.YOUTUBE_KEY || null;


// handle exits
var errors = 0;
process.on ('exit', function () {
  if (errors === 0) {
    console.log ('\n\033[1mDONE, no errors.\033[0m\n');
    process.exit (0);
  } else {
    console.log ('\n\033[1mFAIL, '+ errors +' error'+ (errors > 1 ? 's' : '') +' occurred!\033[0m\n');
    process.exit (1);
  }
});

// prevent errors from killing the process
process.on ('uncaughtException', function (err) {
  console.log ();
  console.error (err.stack);
  console.trace ();
  console.log ();
  errors++;
});

// Queue to prevent flooding
var queue = [];
var next = 0;

function doNext () {
  next++;
  if (queue[next]) {
    queue[next] ();
  }
}

// doTest( passErr, 'methods', [
//   ['feeds', typeof feeds === 'object']
// ])
function doTest (err, label, tests) {
  if (err instanceof Error) {
    console.error (label +': \033[1m\033[31mERROR\033[0m\n');
    console.error (util.inspect (err, {depth: 10, colors: true}));
    console.log ();
    console.error (err.stack);
    console.log ();
    errors++;
  } else {
    var testErrors = [];
    tests.forEach (function (test) {
      if (test[1] !== true) {
        testErrors.push (test[0]);
        errors++;
      }
    });

    if (testErrors.length === 0) {
      console.log (label +': \033[1m\033[32mok\033[0m');
    } else {
      console.error (label +': \033[1m\033[31mfailed\033[0m ('+ testErrors.join (', ') +')');
    }
  }

  doNext ();
}


queue.push (function () {
  app.feeds.videos ({q: 'ShouldNotExists_'+ Date.now()}, function (err, data) {
    doTest (null, 'Error: not found', [
      ['type', err && err instanceof Error],
      ['message', err && err.message === 'not found'],
      ['data', data && data.totalItems === 0]
    ]);
  });
});

queue.push (function () {
  app.video (0, function (err) {
    doTest (null, 'Error: invalid id', [
      ['type', err && err instanceof Error],
      ['message', err && err.message === 'invalid id']
    ]);
  });
});

queue.push (function () {
  app.feeds.videos ({q: 'cheetah'}, function (err, data) {
    doTest (err, 'feeds.videos', [
      ['type', data instanceof Object],
      ['prop', typeof data.itemsPerPage === 'number']
    ]);
  });
});


// Start the tests
console.log ('Running tests...\n');
queue[0] ();
