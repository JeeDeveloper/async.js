var test = require('tape');
var async = require('../series');

if (!Function.prototype.bind) {
    Function.prototype.bind = function (thisArg) {
        var args = Array.prototype.slice.call(arguments, 1);
        var self = this;
        return function () {
            self.apply(thisArg, args.concat(Array.prototype.slice.call(arguments)));
        }
    };
}

function eachIterator(args, x, callback) {
    setTimeout(function(){
        args.push(x);
        callback();
    }, x*25);
}

function mapIterator(call_order, x, callback) {
    setTimeout(function(){
        call_order.push(x);
        callback(null, x*2);
    }, x*25);
}

function filterIterator(x, callback) {
    setTimeout(function(){
        callback(x % 2);
    }, x*25);
}

function detectIterator(call_order, x, callback) {
    setTimeout(function(){
        call_order.push(x);
        callback(x == 2);
    }, x*25);
}

function eachNoCallbackIterator(t, x, callback) {
    t.equal(x, 1);
    callback();
    t.end();
}

function getFunctionsObject(call_order) {
    return {
        one: function(callback){
            setTimeout(function(){
                call_order.push(1);
                callback(null, 1);
            }, 125);
        },
        two: function(callback){
            setTimeout(function(){
                call_order.push(2);
                callback(null, 2);
            }, 200);
        },
        three: function(callback){
            setTimeout(function(){
                call_order.push(3);
                callback(null, 3,3);
            }, 50);
        }
    };
}

test('series function alias', function(t){
  var call_order = [];
  async([
      function(callback){
        setTimeout(function(){
          call_order.push(1);
          callback(null, 1);
        }, 25);
      },
      function(callback){
        setTimeout(function(){
          call_order.push(2);
          callback(null, 2);
        }, 50);
      },
      function(callback){
        setTimeout(function(){
          call_order.push(3);
          callback(null, 3,3);
        }, 15);
      }
    ],
    function(err, results){
      t.false(err);
      t.same(results, [1,2,[3,3]]);
      t.same(call_order, [1,2,3]);
      t.end();
    });
});

test('series', function(t){
    var call_order = [];
    async.series([
        function(callback){
            setTimeout(function(){
                call_order.push(1);
                callback(null, 1);
            }, 25);
        },
        function(callback){
            setTimeout(function(){
                call_order.push(2);
                callback(null, 2);
            }, 50);
        },
        function(callback){
            setTimeout(function(){
                call_order.push(3);
                callback(null, 3,3);
            }, 15);
        }
    ],
    function(err, results){
        t.false(err);
        t.same(results, [1,2,[3,3]]);
        t.same(call_order, [1,2,3]);
        t.end();
    });
});

test('series empty array', function(t){
    async.series([], function(err, results){
        t.false(err);
        t.same(results, []);
        t.end();
    });
});

test('series error', function(t){
    t.plan(1);
    async.series([
        function(callback){
            callback('error', 1);
        },
        function(callback){
            t.ok(false, 'should not be called');
            callback('error2', 2);
        }
    ],
    function(err, results){
        t.equals(err, 'error');
    });
    setTimeout(t.end, 100);
});

test('series no callback', function(t){
    async.series([
        function(callback){callback();},
        function(callback){callback(); t.end();},
    ]);
});

test('series object', function(t){
    var call_order = [];
    async.series(getFunctionsObject(call_order), function(err, results){
        t.false(err);
        t.same(results, {
            one: 1,
            two: 2,
            three: [3,3]
        });
        t.same(call_order, [1,2,3]);
        t.end();
    });
});

test('series call in another context', function(t) {
    if (typeof process === 'undefined') {
        // node only t
        t.end();
        return;
    }
    var vm = require('vm');
    var sandbox = {
        async: async,
        t: t
    };

    var fn = "(" + (function () {
        async.series([function (callback) {
            callback();
        }], function (err) {
            if (err) {
                return t.end(err);
            }
            t.end();
        });
    }).toString() + "())";

    vm.runInNewContext(fn, sandbox);
});

test('eachSeries', function(t){
    var args = [];
    async.eachSeries([1,3,2], eachIterator.bind(this, args), function(err){
        t.same(args, [1,3,2]);
        t.end();
    });
});

test('eachSeries empty array', function(t){
    t.plan(1);
    async.eachSeries([], function(x, callback){
        t.ok(false, 'iterator should not be called');
        callback();
    }, function(err){
        t.ok(true, 'should call callback');
    });
    setTimeout(t.end, 25);
});

test('eachSeries error', function(t){
    t.plan(2);
    var call_order = [];
    async.eachSeries([1,2,3], function(x, callback){
        call_order.push(x);
        callback('error');
    }, function(err){
        t.same(call_order, [1]);
        t.equals(err, 'error');
    });
    setTimeout(t.end, 50);
});

test('eachSeries no callback', function(t){
    async.eachSeries([1], eachNoCallbackIterator.bind(this, t));
});

test('forEachSeries alias', function (t) {
    t.strictEqual(async.eachSeries, async.forEachSeries);
    t.end();
});

test('mapSeries', function(t){
    var call_order = [];
    async.mapSeries([1,3,2], mapIterator.bind(this, call_order), function(err, results){
        t.same(call_order, [1,3,2]);
        t.same(results, [2,6,4]);
        t.end();
    });
});

test('mapSeries error', function(t){
    t.plan(1);
    async.mapSeries([1,2,3], function(x, callback){
        callback('error');
    }, function(err, results){
        t.equals(err, 'error');
    });
    setTimeout(t.end, 50);
});

