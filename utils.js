exports._toString = Object.prototype.toString;

exports._isArray = Array.isArray || function (obj) {
    return _toString.call(obj) === '[object Array]';
  };

exports._each = function (arr, iterator) {
  for (var i = 0; i < arr.length; i += 1) {
    iterator(arr[i], i, arr);
  }
};

exports._keys = function (obj) {
  if (Object.keys) {
    return Object.keys(obj);
  }
  var keys = [];
  for (var k in obj) {
    if (obj.hasOwnProperty(k)) {
      keys.push(k);
    }
  }
  return keys;
};

exports._map = function (arr, iterator) {
  if (arr.map) {
    return arr.map(iterator);
  }
  var results = [];
  _each(arr, function (x, i, a) {
    results.push(iterator(x, i, a));
  });
  return results;
};

exports._asyncMap = function (eachfn, arr, iterator, callback) {
  arr = _map(arr, function (x, i) {
    return {index: i, value: x};
  });
  if (!callback) {
    eachfn(arr, function (x, callback) {
      iterator(x.value, function (err) {
        callback(err);
      });
    });
  } else {
    var results = [];
    eachfn(arr, function (x, callback) {
      iterator(x.value, function (err, v) {
        results[x.index] = v;
        callback(err);
      });
    }, function (err) {
      callback(err, results);
    });
  }
};