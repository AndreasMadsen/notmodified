
function encodeEtag(weak, hash) {
  return (weak ? 'W/' : '') + '"' + hash + '"';
}

module.exports = function (req, res, info) {
  var hashValid = false;
  var mtimeValid = false;

  // Check of hash and mtime was set in info
  var weak = info.hasOwnProperty('weak') ? !!info.weak : false;
  var hash = info.hasOwnProperty('hash') ? info.hash : false;
  var mtime = info.hasOwnProperty('mtime') ? info.mtime : false;

  // Set http headers
  var encodedHash, encodedMtime;
  if (hash) {
    encodedHash = encodeEtag(weak, hash);
    res.setHeader('ETag', encodedHash);
  }
  if (mtime) {
    encodedMtime = info.mtime.toUTCString();
    res.setHeader('Last-Modified', encodedMtime);
  }

  // Was properties set
  var hashSend = req.headers.hasOwnProperty('if-none-match');
  var mtimeSend = req.headers.hasOwnProperty('if-modified-since');

  // Decode client headers
  var clientMtime = req.headers['if-modified-since'];
  var clientHash = req.headers['if-none-match'];

  // Validate mtime and hash
  if (hashSend && hash) {
    hashValid = (clientHash === encodedHash);
  } else if (!hashSend && !hash) {
    hashValid = true;
  }

  if (mtimeSend && mtime) {
    // HTTP header do only support second precition and toUTCString rounds down
    var mtimeRounded = (Math.floor(info.mtime.getTime() / 1000) * 1000);

    mtimeValid = (clientMtime === encodedMtime ||
                  Date.parse(clientMtime) >= mtimeRounded);
  } else if (!mtimeSend && !mtime) {
    mtimeValid = true;
  }

  // If neither types of cache meta data are given the cache is invalid
  if (!mtime && !hash) {
    mtimeValid = false;
  }

  // Check if the given info and headers match
  var valid = (hashValid && mtimeValid);

  // Client cache is valid set statusCode
  if (valid) {
    res.statusCode = 304;
  }

  return valid;
};
