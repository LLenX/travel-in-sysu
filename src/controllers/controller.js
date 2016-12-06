'use strict';
const isWin32 = ~process.platform.indexOf('win32');
let path = require('path');
path = (isWin32 ? path.win32 : path);
const myChildProcess = require('../lib/myChildProcess.js');
const FilesIO = require('../lib/FilesIO.js');
const {
  remote
} = require('electron');

const {
  cowrapAll
} = require('../lib/utility.js');

module.exports = cowrapAll({
  dealWithInput,
  selectAndReadFile
});

function *selectAndReadFile(sender) {
  let content = null;
  const filters = [{
    "name": 'Map Data File (*.mapdat)',
    "extensions": ['mapdat']
  }];
  const filepaths = yield showOpenFileDialog(sender, filters);
  if (!filepaths) return null;
  try {
    content = yield FilesIO.read(filepaths[0]);
  } catch (e) {
    return e;
  }
  try {
    content = JSON.parse(content);
    content['mapPath'] = filepaths[0];
  } catch (e) {
    content = new Error('文件内容损毁。');
  }
  return content;
}

function showOpenFileDialog(sender, filters) {
  return new Promise((resolve) => {
    remote.dialog.showOpenDialog(sender, {
      "properties": ['openFile'],
      filters
    }, function (files) {
      return resolve(files);
    });
  });
}

let child = null;
function *dealWithInput(input) {
  if (child && child.exitCode !== null) {
    child = null;
  }
  if (!child) {
    child = yield myChildProcess.ioSpawn('python3', [ path.join(__dirname, './validate.py') ]);
  }
  let output = null;
  try {
    output = yield child.input(input);
  } catch (e) {
    child = null;
    output = e.message;
  }
  return output;
}
