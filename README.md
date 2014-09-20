#notmodified

> set and validate http cache headers

## Installation

```sheel
npm install notmodified
```

## Example

```javascript
var notmodified = require('notmodified');
var http = require('http');

var startTime = new Date();

http.createServer(function (req, res) {
  var valid = notmodified(req, res, {
    'hash': 'string-value',
    'mtime': startTime
  });

  if (valid) return res.end();

  res.end('Big chunk of data there should be cached');
}).listen();
```

## API documentation

```javascript
var notmodified = requrie('notmodified');
var valid = notmodified(req, res, cache);
```

`requrie('notmodified')` returns a function where the first two arguments
are the http `req` and `res` object. The next argument (`cache`) is an object
containing the cache validation data.

The `notmodified` function returns a `valid` boolean. If `valid` is `true` the
client cache is valid and `res.statusCode` has been set to `304`. However
`res.end()` should stil be called.

The `cache` object can have three optional properties:

* `hash` this is the `ETag` value and must be a string. If its not set no `ETag`
  header will be send. If the client sends a `if-none-match` but no `hash`
  value is given `valid` will be `false`.

* `mtime` is the `Last-Modified` value and must be `Date` object. Just as with
  the `ETag` the header will only be send if `mtime` is specified and `valid`
  will be `false` if the client send `If-Modified-Since` but no `mtime` was set.

* `weak` this is an extension to the `ETag` header and must be a boolean. If
  its not set it defaults to `false`. This indicated if the `ETag` is
  byte-by-byte valid and if a `Range` request makes sence. Specifically if and
  only if `true` `ETag` will be prefixed with `W/`.

## License

**The software is license under "MIT"**

> Copyright (c) 2013 Andreas Madsen
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
