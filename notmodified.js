
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
  if (hash) res.setHeader('ETag', encodeEtag(weak, hash));
  if (mtime) res.setHeader('Last-Modified', info.mtime.toUTCString());

  // Was properties set
  var hashSend = req.headers.hasOwnProperty('if-none-match');
  var mtimeSend = req.headers.hasOwnProperty('if-modified-since');

  // Decode client headers
  var clientMtime = Date.parse(req.headers['if-modified-since']);
  var clientHash = req.headers['if-none-match'];

  // Validate mtime and hash
  if (hashSend && hash) {
    hashValid = (clientHash === hash);
  } else if (!hashSend && !hash) {
    hashValid = true;
  }

  if (mtimeSend && mtime) {
    // HTTP header do only support second precition and toUTCString rounds down
    mtimeValid = (clientMtime >= (Math.floor(info.mtime.getTime() / 1000) * 1000));
  } else if (!mtimeSend && !mtime) {
    mtimeValid = true;
  }

  // Check if the given info and headers match
  var valid = (hashValid && mtimeValid);

  // Client cache is valid set statusCode
  if (valid) {
    res.statusCode = 304;
  }

  return valid;
};
