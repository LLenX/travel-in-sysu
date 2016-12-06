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
      "name": 'Custom File Type',
      "extensions": ['as']
    }, {
      "name": 'All Files',
      "extensions": ['*']
    }];
  const filepaths = yield showOpenFileDialog(sender, filters);
  if (!filepaths) return content;
  try {
    content = yield FilesIO.read(filepaths[0]);
  } catch (e) {
    content = e;
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
    child = yield myChildProcess.ioSpawn(path.join(__dirname, './ans'));
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
