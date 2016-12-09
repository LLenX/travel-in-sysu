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
  startGraphServer,
  sendRequest,
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
    console.error(e);
    return e;
  }
  try {
    content = JSON.parse(content);
    mapdatValidate(content);
    content['mapdatPath'] = filepaths[0];
  } catch (e) {
    content = new Error('文件已损坏');
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

function *startGraphServer(mapdatPath) {
  if (child !== null) {
    child.kill('SIGKILL');
    child = null;
  }
  const serverPyPath = path.join(__dirname, '../run_server.py');
  child = yield myChildProcess.ioSpawn('python3', [ serverPyPath, `${mapdatPath}` ]);
}

function *sendRequest(request) {
  let output = null;
  if (child === null) {
    let error = new Error('要先导入地图');
    console.error(error);
    throw error;
  } else if (child.exitCode !== null) {
    output = child.stdoutData + '\n' + child.stderrData;
    child = null;
    if (output.length) {
      return output;
    }
  }
  try {
    output = yield child.input(request, (curStdout) => {
      if (curStdout.endsWith('\n') &&
          curStdout.split('\n').length === request.split('\n').length) {
        return true;
      } else {
        return false;
      }
    });
    output = JSON.parse(output);
  } catch (e) {
    console.error(e);
    child.kill('SIGKILL');
    child = null;
    output = `${e}`;
  }
  return output;
}

function mapdatValidate(content) {
  return content;
}
