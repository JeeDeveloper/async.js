var fs = require('fs');
var path = require('path');
var es = require('event-stream');
var input, output;
var separator = '\n';

// read command line arguments
if (!module.parent) {
  var args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error('you must provide two arguments: <input file> <output file>');
    process.exit(1);
  }
  input = args[0];
  output = args[1];
  convertStream(input, output);
}

module.exports = convertStream;
function convertStream(input, output) {
  var p = path.resolve(__dirname + '/../../') + '/';
  var test = 'var test = require(\'tape\');\n';
  var l = 0;

  fs.createReadStream(p + input, {flags: 'r'})
    .pipe(es.split(separator))
    .pipe(es.map(function(line, cb) {
      if (l == 0) {
        line = test + line;
      }
      if (line == '};') {
        line = "});";
      }
      l++;
      cb(null, line + separator);
    }))
    .pipe(es.replace('test', 't'))
    .pipe(es.replace('t.expect', 't.plan'))
    .pipe(es.replace('t.done', 't.end'))
    .pipe(es.replace('exports[', 'test('))
    .pipe(es.replace('exports.', 'test('))
    .pipe(es.replace('] = function', ', function'))
    .pipe(fs.createWriteStream(p + output));

}
