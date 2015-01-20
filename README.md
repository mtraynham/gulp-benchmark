# gulp-benchmark

[![Build Status](https://semaphoreapp.com/api/v1/projects/5f3fd517-c88d-474a-9f4d-07f0a37855ce/326765/badge.png)](https://semaphoreapp.com/vic/gulp-benchmark) [![Code Climate](https://codeclimate.com/github/VicNumber21/gulp-benchmark/badges/gpa.svg)](https://codeclimate.com/github/VicNumber21/gulp-benchmark) [![Test Coverage](https://codeclimate.com/github/VicNumber21/gulp-benchmark/badges/coverage.svg)](https://codeclimate.com/github/VicNumber21/gulp-benchmark)

Run performance [Benchmark](http://benchmarkjs.com/) tests.

Inspired by [gulp-bench](https://github.com/hiddentao/gulp-bench) (which is port from [grunt-benchmark](https://github.com/shama/grunt-benchmark))
and [gulp-bench-summary](https://github.com/ai/gulp-bench-summary).

## Install

```bash
$ npm install --save-dev gulp-benchmark
```

## Why yet another Benchmark runner was created

The main reason was to add ability to load your type of benchmark sources and
(what was more important) to control how to report about results.

Combination of [gulp-bench](https://github.com/hiddentao/gulp-bench) and [gulp-bench-summary](https://github.com/ai/gulp-bench-summary)
was almost what I needed but it does not allow you to disable not required output from [gulp-bench](https://github.com/hiddentao/gulp-bench)

After some thinking, it was decided to build yet another benchmark runner which has the following abilities:

1. Separated **load**, **run** and **report** stages to enable an ability to create manual loader / reporter without need to
   change whole flow;
1. Loader provides support of [grunt-benchmark](https://github.com/shama/grunt-benchmark) format as well as
   original [Benchmark](http://benchmarkjs.com/);
1. Runner provides an ability to disable or modify progress output;
1. Reporter provides an ability to report in several formats at once;
1. Formats similar to Original reports (inherited from [gulp-bench](https://github.com/hiddentao/gulp-bench)) should be supported
as well as summary format similar to [gulp-bench-summary](https://github.com/ai/gulp-bench-summary);

**WARNING**: although loader and reporter provides support of formats similar to provided by [gulp-bench](https://github.com/hiddentao/gulp-bench)
             and [gulp-bench-summary](https://github.com/ai/gulp-bench-summary), there are several differences;
             just be aware that it was not a copy/paste from those repos to mine;
             feel free to report about inconveniences if any via opening an [issue](https://github.com/VicNumber21/gulp-benchmark/issues)

## Usage

The usage syntax below is the same as for [grunt-benchmark](https://github.com/shama/grunt-benchmark) with addition of
original [Benchmark](http://benchmarkjs.com/) format.

Let's assume that your benchmark test in `test.js` is an example from [Benchmark-Suite](#benchmark-suite)

In your gulpfile:

```js
var gulp = require('gulp');
var benchmark = require('gulp-benchmark');

gulp.task('default', function () {
	return gulp.src('test.js', {read: false})
		.pipe(benchmark.load())
		.pipe(benchmark.run())
		.pipe(benchmark.report(benchmark.reporters.etalon('RegExp#test')));
});
```

Run it:

```bash
$ gulp
[23:00:53] Starting 'default'...
[23:00:53] Using gulpfile ~/proj/gulp-benchmark-tests/basic/gulpfile.js
[23:00:53] Running "Search" from ~/proj/gulp-benchmark-tests/basic/test.js ...
[23:00:59]   RegExp#test x 17,969,059 ops/sec ±0.91% (96 runs sampled)
[23:01:04]   String#indexOf x 29,815,907 ops/sec ±0.68% (97 runs sampled)
[23:01:09]   String#match x 12,726,022 ops/sec ±0.77% (96 runs sampled)
[23:01:09] "Search" from ~/proj/gulp-benchmark-tests/basic/test.js (passed: 3 ,failed: 0)
[23:01:09]  Passed:
[23:01:09]   "String#indexOf" at 1.66x faster
[23:01:09]   "RegExp#test" is etalon
[23:01:09]   "String#match" at 1.41x slower
[23:01:09] Finished 'default' after 16 s
```

If you also need to report into file, you may modify gulpfile into:

```js
var gulp = require('gulp');
var benchmark = require('gulp-benchmark');

gulp.task('default', function () {
	return gulp.src('test.js', {read: false})
		.pipe(benchmark.load())
		.pipe(benchmark.run())
		.pipe(benchmark.report([
		  benchmark.reporters.etalon('RegExp#test'),
		  benchmark.reporters.json()
    ]))
    .pipe(gulp.dest('.'));
});
```

It will give you the similar output as above and also will create **benchmark-results.json** in the current directory.

You can modify the results filename by supplying [json reporter path option](#reporters).

### Benchmark format

Note that to use original [Benchmark](http://benchmarkjs.com/) format you have to install [Benchmark](http://benchmarkjs.com/):

```bash
$ npm install --save-dev benchmark
```

For [grunt-benchmark](https://github.com/shama/grunt-benchmark) formats you don't need this step though.

#### Benchmark suite


```js
var Benchmark = require('benchmark');
var suite = new Benchmark.Suite('Search');

suite.add('RegExp#test', function() {
    /o/.test('Hello World!');
  })
  .add('String#indexOf', function() {
    'Hello World!'.indexOf('o') > -1;
  })
  .add('String#match', function() {
    !!'Hello World!'.match(/o/);
  });

module.exports = suite;
```

#### Benchmark single test

```js
var Benchmark = require('benchmark');

var bench = new Benchmark({
  name: 'RegExp#test',
  fn: function() {
    /o/.test('Hello World!');
  }
});

module.exports = bench;
```

### Grunt-Benchmark format

#### Standalone function

```js
module.exports = function() {
  /o/.test('Hello World!');
};
```

##### Object with function and options

```js
module.exports = {
  name: 'Timeout (asynchronous)',
  maxTime: 0.1,
  defer: true,
  onComplete: function() {
    console.log('Hooray!');
  },
  fn: function(deferred) {
    setTimeout(function() {
      deferred.resolve();
    }, 1);
  }
};
```

##### Test suites

###### Array of functions

```js
module.exports = {
  name: 'Search',
  maxTime: 2,
  tests: [
    function() {
      /o/.test('Hello World!');
    },
    function() {
      'Hello World!'.indexOf('o') > -1;
    },
    function() {
      !!'Hello World!'.match(/o/);
    }
  ]
};
```

##### Array of objects

```js
module.exports = {
  name: 'Timeout Showdown',
  maxTime: 2,
  tests: [
    {
      name: 'Return immediately (synchronous)',
      fn: function() {
          return;
      }
    }, {
      name: 'Timeout 50ms (asynchronous)',
      defer: true,
      fn: function(deferred) {
        setTimeout(function() {
          deferred.resolve();
        }, 50);
      }
    }, {
      name: 'Timeout 100ms (asynchronous)',
      defer: true,
      fn: function(deferred) {
        setTimeout(function() {
          deferred.resolve();
        }, 50);
      }
    }
  ]
};
```

##### Object with tests as fields

```js
module.exports = {
  name: 'Timeout Showdown',
  maxTime: 2,
  tests: {
    'Return immediately (synchronous)': function() {
      return;
    },
    'Timeout: 50ms (asynchronous)': {
      defer: true,
      fn: function(deferred) {
        setTimeout(function() {
          deferred.resolve();
        }, 50);
      }
    },
    'Timeout: 100ms (asynchronous)': {
      defer: true,
      fn: function(deferred) {
        setTimeout(function() {
          deferred.resolve();
        }, 100);
      }
    }
  }
};
```

## Options

### load

No options

### run

#### logger

Type: `Object`
Default: `loggers.default`

Specifies how to track progress of suite run.

**gulp-benchmark** provides the following loggers:
* **default** - prints Benchmark object converted to string
* **silent** - prints nothing

#### failOnError

Type: `boolean`
Default: `true`

If error happens in any test, error at the end of run is thrown into pipe.

### report

#### reporters
Type: `function` or `array of functions`
Default: `reporters.etalon`

Specifies the format(s) for the report.
If several reporters are given, they work in given order.

**gulp-benchmark** provides the following reporters:
* **etalon** - prints comparative analysis where given etalon (test name) is a unit of metric;
               default etalon is the first test in the suite;
* **fastest** - print [grunt-benchmark](https://github.com/shama/grunt-benchmark)-like report
                to compare the fastest test with the second fastest one;
* **json** - creates json file with benchmark run statistic;
             ```path``` is an option to specify report name, default is ```./benchmark-results.json```;
* **csv** - creates csv file with benchmark run statistic
            ```path``` is an option to specify report name, default is ```./benchmark-results.csv```;
            (quite ugly at the moment; contributing for improvements are very welcome);

### Hooks

#### Custom loader

You may implement custom loader.
The only thing, expected by ```run``` is it should be Benchmark.Suite instance in the pipe.

Example (just for reference):

```js
var through = require('through2');

var myLoad = function () {
  return through.obj(function (file, enc, cb) {
    var suite = new Benchmark.Suite('Empty');
    cb(null, suite);
  });
};
```

Refer to [through2](https://github.com/rvagg/through2) and to
[gulp plugin guidelines](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md)

#### Custom logger

You may implement your own logger to e.g. redirect progress output into file.

The logger object may provide four methods: ```onStart```, ```onCycle```, ```onError``` and ```onComplete```.

```onStart``` is called just before test suite run

```onCycle``` is called after each test run

```onComplete``` and ```onError``` are called after run depending on run result

```onStart```, ```onError``` and ```onComplete``` are called with an instance of Benchmark.Suite and
```onCycle``` is called with the instance of Benchmark.Events.

Example (default logger):
```js
var gutil = require('gulp-util');

var defaultLogger = {
  onStart: function (suite) {
    gutil.log('Running ' + suite.name + ' ...');
  },

  onCycle: function (event) {
    var target = event.target;
    var suffix = target.error? gutil.colors.red(' error'): '';
    gutil.log('  ' + target + suffix);
  },

  onError: function (suite) {
    gutil.log(gutil.colors.red('Errors') + ' in ' + suite.name + ':');

    suite.forEach(function (test) {
      if (test.error) {
        gutil.log('  ' + test.name + ': ' + test.error);
      }
    });
  }
};
```

Reference: [gutil](https://github.com/gulpjs/gulp-util)

#### Custom reporter

You may create your own reporter.

Reporter is a function with two arguments: ```data``` and ```storageRef```.

```data``` is a statistic of Benchmark.Suite run.
At the moment it is an instance of Benchmark.Suite after run but in future it could be changed in a way to provide just
data fields of Benchmark.Suite instance (jsonify it).
It means that you should not expect that Benchmark api is working on the data,
but also you may expect that call of Benchmark methods with ```data``` as ```this``` should work.

```storageRef``` is container of storage - object with only field ```storage```.
By default storage is ```null```.

If you create console reporter, you don't need to care about ```storage``` and ```storageRef```.

However, if you need to report into file, you have to do the following:

1. Initialize ```storage``` by object with ```contents``` method returning ```string```.
   Most cases you need to do initialization once, so check if ```storage``` is ```null``` or not;
1. Create report data basing on ```data``` and append it to ```storage```;

Example (json reporter):

```js
var _ = require('lodash');

var jsonReporter = function (options) {
  options = options || {};

  return function (data, storageRef) {
    if (!storageRef.storage) {
      storageRef.storage = {
        records: [],
        path: options.path || './benchmark-results.json',
        contents: function () {
          return JSON.stringify(this.records, null, '  ');
        }
      };
    }

    var total = _(data).toArray().compact().value();

    var record = {
      name: data.name,
      results: _.map(total, function (test) {
        return {
          name : test.name,
          times: test.times,
          stats: test.stats,
          error : test.error,
          count : test.count,
          cycles: test.cycles,
          hz : test.hz
        };
      })
    };

    storageRef.storage.records.push(record);
  };
};
```

## License

MIT - see [LICENSE](https://raw.githubusercontent.com/VicNumber21/gulp-benchmark/master/LICENSE)
