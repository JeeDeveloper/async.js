var util = require('./util');

var doSeries = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    return fn.apply(null, [async.eachSeries].concat(args));
  };
};

var async = {};

async.series = function (tasks, callback) {
  callback = callback || function () {};
  if (_isArray(tasks)) {
    async.mapSeries(tasks, function (fn, callback) {
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
    async.eachSeries(_keys(tasks), function (k, callback) {
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

async.eachSeries = function (arr, iterator, callback) {
  callback = callback || function () {};
  if (!arr.length) {
    return callback();
  }
  var completed = 0;
  var iterate = function () {
    iterator(arr[completed], function (err) {
      if (err) {
        callback(err);
        callback = function () {};
      }
      else {
        completed += 1;
        if (completed >= arr.length) {
          callback();
        }
        else {
          iterate();
        }
      }
    });
  };
  iterate();
};
async.forEachSeries = async.eachSeries;

async.mapSeries = doSeries(_asyncMap);

exports = module.exports = async.series;
exports.series = async.series;
exports.mapSeries = async.mapSeries;
exports.eachSeries = async.eachSeries;
exports.forEachSeries = async.forEachSeries;