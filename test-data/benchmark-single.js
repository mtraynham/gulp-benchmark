var Benchmark = require('benchmark');


var bench = new Benchmark({
  name: 'RegExp#test',
  maxTime: 0.1,
  fn: function() {
    /o/.test('Hello World!');
  }
});


module.exports = bench;
