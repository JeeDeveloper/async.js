var test = require('tape');
var async = require('../parallel');

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

test('parallel function alias', function(t){
  var call_order = [];
  async([
      function(callback){
        setTimeout(function(){
          call_order.push(1);
          callback(null, 1);
        }, 50);
      },
      function(callback){
        setTimeout(function(){
          call_order.push(2);
          callback(null, 2);
        }, 100);
      },
      function(callback){
        setTimeout(function(){
          call_order.push(3);
          callback(null, 3,3);
        }, 25);
      }
    ],
    function(err, results){
      t.false(err);
      t.same(call_order, [3,1,2]);
      t.same(results, [1,2,[3,3]]);
      t.end();
    });
});

test('parallel', function(t){
  var call_order = [];
  async.parallel([
      function(callback){
        setTimeout(function(){
          call_order.push(1);
          callback(null, 1);
        }, 50);
      },
      function(callback){
        setTimeout(function(){
          call_order.push(2);
          callback(null, 2);
        }, 100);
      },
      function(callback){
        setTimeout(function(){
          call_order.push(3);
          callback(null, 3,3);
        }, 25);
      }
    ],
    function(err, results){
      t.false(err);
      t.same(call_order, [3,1,2]);
      t.same(results, [1,2,[3,3]]);
      t.end();
    });
});

test('parallel empty array', function(t){
  async.parallel([], function(err, results){
    t.false(err);
    t.same(results, []);
    t.end();
  });
});

test('parallel error', function(t){
  async.parallel([
      function(callback){
        callback('error', 1);
      },
      function(callback){
        callback('error2', 2);
      }
    ],
    function(err, results){
      t.equals(err, 'error');
    });
  setTimeout(t.end, 100);
});

test('parallel no callback', function(t){
  async.parallel([
    function(callback){callback();},
    function(callback){callback(); t.end();},
  ]);
});

test('parallel object', function(t){
  var call_order = [];
  async.parallel(getFunctionsObject(call_order), function(err, results){
    t.false(err);
    t.same(call_order, [3,1,2]);
    t.same(results, {
      one: 1,
      two: 2,
      three: [3,3]
    });
    t.end();
  });
});

test('each', function(t){
    var args = [];
    async.each([1,3,2], eachIterator.bind(this, args), function(err){
        t.same(args, [1,2,3]);
        t.end();
    });
});

test('each extra callback', function(t){
    var count = 0;
    async.each([1,3,2], function(val, callback) {
        count++;
        callback();
        t.throws(callback);
        if (count == 3) {
            t.end();
        }
    });
});

test('each empty array', function(t){
    t.plan(1);
    async.each([], function(x, callback){
        t.ok(false, 'iterator should not be called');
        callback();
    }, function(err){
        t.ok(true, 'should call callback');
    });
    setTimeout(t.end, 25);
});

test('each error', function(t){
    t.plan(1);
    async.each([1,2,3], function(x, callback){
        callback('error');
    }, function(err){
        t.equals(err, 'error');
    });
    setTimeout(t.end, 50);
});

test('each no callback', function(t){
    async.each([1], eachNoCallbackIterator.bind(this, t));
});

test('forEach alias', function (t) {
    t.strictEqual(async.each, async.forEach);
    t.end();
});

test('map', function(t){
    var call_order = [];
    async.map([1,3,2], mapIterator.bind(this, call_order), function(err, results){
        t.same(call_order, [1,2,3]);
        t.same(results, [2,6,4]);
        t.end();
    });
});

test('map original untouched', function(t){
    var a = [1,2,3];
    async.map(a, function(x, callback){
        callback(null, x*2);
    }, function(err, results){
        t.same(results, [2,4,6]);
        t.same(a, [1,2,3]);
        t.end();
    });
});

test('map without main callback', function(t){
    var a = [1,2,3];
    var r = [];
    async.map(a, function(x, callback){
        r.push(x);
        callback(null);
        if (r.length >= a.length) {
            t.same(r, a);
            t.end();
        }
    });
});

test('map error', function(t){
    t.plan(1);
    async.map([1,2,3], function(x, callback){
        callback('error');
    }, function(err, results){
        t.equals(err, 'error');
    });
    setTimeout(t.end, 50);
});

