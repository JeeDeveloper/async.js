var async = {};

var _each = function (arr, iterator) {
  for (var i = 0; i < arr.length; i += 1) {
    iterator(arr[i], i, arr);
  }
};

var _asyncMap = function (eachfn, arr, iterator, callback) {
  arr = arr.map(function (x, i) {
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

function only_once(fn) {
  var called = false;
  return function() {
    if (called) throw new Error("Callback was already called.");
    called = true;
    fn.apply(this, arguments);
  }
}

var _parallel = function(eachfn, tasks, callback) {
  callback = callback || function () {};
  if (Array.isArray(tasks)) {
    eachfn.map(tasks, function (fn, callback) {
      if (fn) {
        fn(function (err) {
          var args = Array.prototype.slice.call(arguments, 1);
          if (args.length <= 1) {
            args = args[0];
          }
          callback.call(null, err, args);
        });
      }
    }, callback);
  }
  else {
    var results = {};
    eachfn.each(Object.keys(tasks), function (k, callback) {
      tasks[k](function (err) {
        var args = Array.prototype.slice.call(arguments, 1);
        if (args.length <= 1) {
          args = args[0];
        }
        results[k] = args;
        callback(err);
      });
    }, function (err) {
      callback(err, results);
    });
  }
};

var doParallel = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    return fn.apply(null, [async.each].concat(args));
  };
};

async.parallel = function (tasks, callback) {
  _parallel({ map: async.map, each: async.each }, tasks, callback);
};

async.map = doParallel(_asyncMap);

async.each = function (arr, iterator, callback) {
  callback = callback || function () {};
  if (!arr.length) {
    return callback();
  }
  var completed = 0;
  _each(arr, function (x) {
    iterator(x, only_once(done) );
  });
  function done(err) {
    if (err) {
      callback(err);
      callback = function () {};
    }
    else {
      completed += 1;
      if (completed >= arr.length) {
        callback();
      }
    }
  }
};
async.forEach = async.each;

exports = module.exports = async.parallel;
exports.parallel = async.parallel;
exports.map = async.map;
exports.each = async.each;
exports.forEach = async.forEach;
