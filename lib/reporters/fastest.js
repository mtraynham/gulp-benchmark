'use strict';

var Benchmark = require('benchmark');
var util = require('../util');
var gutil = require('gulp-util');

module.exports = function () {
  return function (data) {
    var total = util.total(data);
    var split = util.split(total);
    var passed = util.sortFastestFirst(split.passed);

    if (passed.length === 0) {
      gutil.log('No passed tests');
    }
    else if (passed.length === 1) {
      gutil.log('Only test passed: ' + Benchmark.prototype.toString.call(passed[0]));
    }
    else {
      var first = passed[0];
      var second = passed[1];
      var times = first.hz / second.hz;
      var timesStr = Benchmark.formatNumber(times.toFixed(times < 2 ? 2 : 1));
      gutil.log('Fastest test is ' + first.name + ' at ' + timesStr + 'x faster than ' + second.name);
    }
  };
};