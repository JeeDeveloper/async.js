# async.js

subset of [async.js](https://github.com/caolan/async).

[![browser support](https://ci.testling.com/intesso/async.js.png)
](https://ci.testling.com/intesso/async.js)

## why?


because [async.js](https://github.com/caolan/async) is awesome and fool proof.

most of the time we only use very little of what async offers.

therefore we extracted only these functions and bundled them together.

development file size: `4kb` instead of [29.6kb](https://github.com/caolan/async#download)


## what is included?

### Collections

  - `each`
  - `eachSeries`
  - `map`
  - `mapSeries`


### Control Flow

  - `parallel`
  - `series`

## install

```bash
npm install async.js
```

## use

you can use this module with browserify or use the `global` versions with `async` exposed:
  - 4.9kb [async.js]()
  - 2.9kb [async.min.js]()

There is even a smaller subset if needed with browserify:


`var async = require('async.js/parallel');`
which contains:
  - `each`
  - `map`
  - `parallel`

and 

`var async = require('async.js/series');`
which contains:
  - `eachSeries`
  - `mapSeries`
  - `series`

for further documentation, please read the original [readme](https://github.com/caolan/async)
