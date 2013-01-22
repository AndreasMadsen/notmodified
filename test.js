
var http = require('http');
var url = require('url');
var test = require('tap').test;

var notmodified = require('./notmodified.js');

var hash = 'BADA55';
var start = new Date();

function request(href, info, callback) {
  var send = url.parse(href);
      send.headers = {};

  if (info.mtime) send.headers['if-modified-since'] = info.mtime.toUTCString();
  if (info.hash) send.headers['if-none-match'] = info.hash;

  return http.get(send, callback);
}

var server = http.createServer(function (req, res) {
  if (req.url === '/both') {
    notmodified(req, res, { 'hash': hash, 'mtime': start });
  }

  else if (req.url === '/hash') {
    notmodified(req, res, { 'hash': hash });
  }

  else if (req.url === '/weak') {
    notmodified(req, res, { 'hash': hash, 'weak': true });
  }

  else if (req.url === '/mtime') {
    notmodified(req, res, { 'mtime': start });
  }

  else if (req.url === '/none') {
    notmodified(req, res, {});
  }

  else {
    res.statusCode = 404;
  }

  res.end();
});

server.listen(0, '127.0.0.1', function () {
  var hostname = 'http://127.0.0.1:' + server.address().port;

  //
  // Test both
  //
  test('Status code is 200 if either is send and both is required', function (t) {
    request(hostname + '/both', {}, function (res) {
      t.equal(res.headers.etag, '"' + hash + '"');
      t.equal(res.headers['last-modified'], start.toUTCString());
      t.equal(res.statusCode, 200);
      t.end();
    });
  });

  test('Status code is 200 if only mtime is send and both is required', function (t) {
    request(hostname + '/both', {
      mtime: start
    }, function (res) {
      t.equal(res.headers.etag, '"' + hash + '"');
      t.equal(res.headers['last-modified'], start.toUTCString());
      t.equal(res.statusCode, 200);
      t.end();
    });
  });

  test('Status code is 200 if just mtime is wrong and both is required', function (t) {
    request(hostname + '/both', {
      mtime: new Date(0),
      hash: '"' + hash + '"'
    }, function (res) {
      t.equal(res.headers.etag, '"' + hash + '"');
      t.equal(res.headers['last-modified'], start.toUTCString());
      t.equal(res.statusCode, 200);
      t.end();
    });
  });

  test('Status code is 200 if only etag is send and both is required', function (t) {
    request(hostname + '/both', {
      hash: '"' + hash + '"'
    }, function (res) {
      t.equal(res.headers.etag, '"' + hash + '"');
      t.equal(res.headers['last-modified'], start.toUTCString());
      t.equal(res.statusCode, 200);
      t.end();
    });
  });

  test('Status code is 200 if just etag is wrong and both is required', function (t) {
    request(hostname + '/both', {
      mtime: start,
      hash: '"WRONG"'
    }, function (res) {
      t.equal(res.headers.etag, '"' + hash + '"');
      t.equal(res.headers['last-modified'], start.toUTCString());
      t.equal(res.statusCode, 200);
      t.end();
    });
  });

  test('Status code is 304 if both match and both is required', function (t) {
    request(hostname + '/both', {
      mtime: start,
      hash: '"' + hash + '"'
    }, function (res) {
      t.equal(res.headers.etag, '"' + hash + '"');
      t.equal(res.headers['last-modified'], start.toUTCString());
      t.equal(res.statusCode, 304);
      t.end();
    });
  });

  test('Status code is 200 if mtime is old and both is required', function (t) {
    request(hostname + '/both', {
      mtime: new Date(start.getTime() - 1000),
      hash: '"' + hash + '"'
    }, function (res) {
      t.equal(res.headers.etag, '"' + hash + '"');
      t.equal(res.headers['last-modified'], start.toUTCString());
      t.equal(res.statusCode, 200);
      t.end();
    });
  });

  test('Status code is 304 if mtime is new and both is required', function (t) {
    request(hostname + '/both', {
      mtime: new Date(start.getTime() + 1000),
      hash: '"' + hash + '"'
    }, function (res) {
      t.equal(res.headers.etag, '"' + hash + '"');
      t.equal(res.headers['last-modified'], start.toUTCString());
      t.equal(res.statusCode, 304);
      t.end();
    });
  });

  //
  // Test mtime
  //
  test('Status code is 200 if either is send and mtime is required', function (t) {
    request(hostname + '/mtime', {}, function (res) {
      t.equal(res.headers.etag, undefined);
      t.equal(res.headers['last-modified'], start.toUTCString());
      t.equal(res.statusCode, 200);
      t.end();
    });
  });

  test('Status code is 304 if only mtime is send and mtime is required', function (t) {
    request(hostname + '/mtime', {
      mtime: start
    }, function (res) {
      t.equal(res.headers.etag, undefined);
      t.equal(res.headers['last-modified'], start.toUTCString());
      t.equal(res.statusCode, 304);
      t.end();
    });
  });

  test('Status code is 200 if mtime is wrong and mtime is required', function (t) {
    request(hostname + '/mtime', {
      mtime: new Date(0)
    }, function (res) {
      t.equal(res.headers.etag, undefined);
      t.equal(res.headers['last-modified'], start.toUTCString());
      t.equal(res.statusCode, 200);
      t.end();
    });
  });

  test('Status code is 200 if only etag is send and mtime is required', function (t) {
    request(hostname + '/mtime', {
      hash: '"' + hash + '"'
    }, function (res) {
      t.equal(res.headers.etag, undefined);
      t.equal(res.headers['last-modified'], start.toUTCString());
      t.equal(res.statusCode, 200);
      t.end();
    });
  });

  test('Status code is 200 if both are send and mtime is required', function (t) {
    request(hostname + '/mtime', {
      mtime: start,
      hash: '"' + hash + '"'
    }, function (res) {
      t.equal(res.headers.etag, undefined);
      t.equal(res.headers['last-modified'], start.toUTCString());
      t.equal(res.statusCode, 200);
      t.end();
    });
  });

  test('Status code is 200 if mtime is old and mtime is required', function (t) {
    request(hostname + '/mtime', {
      mtime: new Date(start.getTime() - 1000)
    }, function (res) {
      t.equal(res.headers.etag, undefined);
      t.equal(res.headers['last-modified'], start.toUTCString());
      t.equal(res.statusCode, 200);
      t.end();
    });
  });

  test('Status code is 304 if mtime is new and mtime is required', function (t) {
    request(hostname + '/mtime', {
      mtime: new Date(start.getTime() + 1000)
    }, function (res) {
      t.equal(res.headers.etag, undefined);
      t.equal(res.headers['last-modified'], start.toUTCString());
      t.equal(res.statusCode, 304);
      t.end();
    });
  });

  //
  // Test hash
  //
  test('Status code is 200 if either is send and mtime is required', function (t) {
    request(hostname + '/hash', {}, function (res) {
      t.equal(res.headers.etag, '"' + hash + '"');
      t.equal(res.headers['last-modified'], undefined);
      t.equal(res.statusCode, 200);
      t.end();
    });
  });

  test('Status code is 304 if only etag is send and etag is required', function (t) {
    request(hostname + '/hash', {
      hash: '"' + hash + '"'
    }, function (res) {
      t.equal(res.headers.etag, '"' + hash + '"');
      t.equal(res.headers['last-modified'], undefined);
      t.equal(res.statusCode, 304);
      t.end();
    });
  });

  test('Status code is 200 if etag is wrong and etag is required', function (t) {
    request(hostname + '/hash', {
      hash: '"WRONG"'
    }, function (res) {
      t.equal(res.headers.etag, '"' + hash + '"');
      t.equal(res.headers['last-modified'], undefined);
      t.equal(res.statusCode, 200);
      t.end();
    });
  });

  test('Status code is 200 if only mtime is send and etag is required', function (t) {
    request(hostname + '/hash', {
      mtime: start
    }, function (res) {
      t.equal(res.headers.etag, '"' + hash + '"');
      t.equal(res.headers['last-modified'], undefined);
      t.equal(res.statusCode, 200);
      t.end();
    });
  });

  test('Status code is 200 if both are send and etag is required', function (t) {
    request(hostname + '/hash', {
      mtime: start,
      hash: '"' + hash + '"'
    }, function (res) {
      t.equal(res.headers.etag, '"' + hash + '"');
      t.equal(res.headers['last-modified'], undefined);
      t.equal(res.statusCode, 200);
      t.end();
    });
  });

  //
  // Test hash
  //
  test('Status code is 200 if either is send and mtime is required', function (t) {
    request(hostname + '/weak', {}, function (res) {
      t.equal(res.headers.etag, 'W/"' + hash + '"');
      t.equal(res.headers['last-modified'], undefined);
      t.equal(res.statusCode, 200);
      t.end();
    });
  });

  test('Status code is 304 if only etag is send and weak etag is required', function (t) {
    request(hostname + '/weak', {
      hash: 'W/"' + hash + '"'
    }, function (res) {
      t.equal(res.headers.etag, 'W/"' + hash + '"');
      t.equal(res.headers['last-modified'], undefined);
      t.equal(res.statusCode, 304);
      t.end();
    });
  });

  test('Status code is 200 if etag is wrong and weak etag is required', function (t) {
    request(hostname + '/weak', {
      hash: 'W/"WRONG"'
    }, function (res) {
      t.equal(res.headers.etag, 'W/"' + hash + '"');
      t.equal(res.headers['last-modified'], undefined);
      t.equal(res.statusCode, 200);
      t.end();
    });
  });

  test('Status code is 200 if only mtime is send and weak etag is required', function (t) {
    request(hostname + '/weak', {
      mtime: start
    }, function (res) {
      t.equal(res.headers.etag, 'W/"' + hash + '"');
      t.equal(res.headers['last-modified'], undefined);
      t.equal(res.statusCode, 200);
      t.end();
    });
  });

  test('Status code is 200 if both are send and weak etag is required', function (t) {
    request(hostname + '/weak', {
      mtime: start,
      hash: 'W/"' + hash + '"'
    }, function (res) {
      t.equal(res.headers.etag, 'W/"' + hash + '"');
      t.equal(res.headers['last-modified'], undefined);
      t.equal(res.statusCode, 200);
      t.end();
    });
  });

  //
  // Nothing set
  //
  test('Status code is 200 if nothing is required', function (t) {
    request(hostname + '/none', {
      mtime: start,
      hash: 'W/"' + hash + '"'
    }, function (res) {
      t.equal(res.headers.etag, undefined);
      t.equal(res.headers['last-modified'], undefined);
      t.equal(res.statusCode, 200);
      t.end();
    });
  });

  test('close', function (t) {
    server.close(function () {
      t.end();
    });
  });
});