'use strict';
const childProcess = require('child_process');
const {
  addPropertiesFrom
} = require('./utility.js');

const maxBuffer = 10 * 1024 * 1024;
module.exports = {
  exec,
  spawn,
  ioSpawn
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
    if (options && options.stdin) {
      child.stdin.end(options.stdin);
    }
    let stdout = '', stderr = '';
    child.stdout.on('data', (data) => stdout += data);
    child.stderr.on('data', (data) => stderr += data);
    child.on('close', (code) => resolve([ code, stdout, stderr ]));
  });
}

class ioChildProcess {
  constructor(args) {
    let self = this;
    self['child'] = childProcess.spawn.apply(childProcess, args);
    self.memberInit();
    self.stdout.on('data', (data) => {
      self.stdoutData += data.toString();
      self.onResponse(null);
    });
    self.stderr.on('data', (data) => {
      self.stderrData += data.toString();
      self.onResponse(new Error(self.stderrData));
    });
    self.child.on('exit', (code) => {
      self.exitCode = code;
      self.onResponse(code);
    });
    self.child.on('error', (err) => {
      self.error = err;
      self.onResponse(err);
    });
  }
  memberInit() {
    let self = this;
    addPropertiesFrom(self, self.child, ['stdin', 'stdout', 'stderr', 'kill']);
    self['inputData'] = self['stdoutData'] = self['stderrData'] = '';
    self['onOutputData'] = self['exitCode'] = null;
  }
  input(input) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.inputData += String(input);
      self.onOutputData = function(err, outputData) {
        if (err) {
          return reject(outputData);
        } else {
          return resolve(outputData);
        }
      }
      self.stdin.write(input);
    });
  }
  onResponse(err) {
    let self = this;
    if (!self.onOutputData) return;
    let outputData = (err ? err.message() : self.stdoutData),
        onOutputData = self.onOutputData;
    self.onOutputData = null;
    err ? self.stderrData = '' : self.stdoutData = '';
    onOutputData(err, outputData);
  }
}

function ioSpawn(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = new ioChildProcess(arguments);
    if (options && options.stdin) {
      child.stdin.write(options.stdin);
    }
    return resolve(child);
  });
}


