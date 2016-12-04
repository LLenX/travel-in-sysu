'use strict';
const childProcess = require('child_process');
const stream = require('stream');
const maxBuffer = 10 * 1024 * 1024;
module.exports = {
  exec,
  spawn
};
function exec(command) {
  return new Promise((resolve, reject) => {
    childProcess.exec(command, {
      "maxBuffer": maxBuffer
    }, function() {
      return resolve(arguments);
    });
  });
}

function spawn(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = childProcess.spawn(command, args, options);
    if (options.stdin) {
      const inStream = new stream.Readable();
      inStream.setEncoding('utf-8');
      inStream.push(options.stdin);
      inStream.push(null);
      inStream.pipe(child.stdin);
    }
    let stdout = '', stderr = '';
    child.stdout.on('data', (data) => stdout += data);
    child.stderr.on('data', (data) => stderr += data);
    child.on('close', (code) => resolve([code, stdout, stderr]));
  });
}
