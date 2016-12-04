var childProcess = require('child_process');
var exec = childProcess.exec;
var maxBuffer = 10 * 1024 * 1024;
function myExec(command) {
  return new Promise(function(resolve, reject) {
    exec(command, {
      "maxBuffer": maxBuffer
    }, function() {
      return resolve(arguments);
    });
  });
}

module.exports = myExec;
