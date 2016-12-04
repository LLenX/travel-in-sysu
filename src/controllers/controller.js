'use strict';
const isWin32 = ~process.platform.indexOf('win32');
let path = require('path');
path = (isWin32 ? path.win32 : path);
const myChildProcess = require('../lib/myChildProcess.js');
const FilesIO = require('../lib/FilesIO.js');
const {
  cowrapAll
} = require('../lib/utility.js');

module.exports = cowrapAll({
  task
});

function *task(name) {
  let [error, stdout1, stderr1] = yield myChildProcess.exec(`echo 'Hi, ${name}'`);
  if (error) {
    // hai mei xiang hao
  }

  let stdin = getRandomInput();
  let [code, stdout2, stderr2] =
      yield myChildProcess.spawn(path.join(__dirname, './ans'), [], {stdin});
  if (code !== 0) {
    // hai mei xiang hao
  }
  let ret =
`echo output:
${stdout1}

module of reverse
=============== input ===============
${stdin}

======= standard answer output ======
${stdout2}`;
  return ret;
}

function getRandomInput() {
  let stdin = ``;
  let caseNum = getRandomInt(1, 10);
  let length = 0, mod = 0, difficulty = 0, leadingZeroLength = 0;
  stdin += `${caseNum}\n`
  for (let caseIndex = 0; caseIndex != caseNum; ++caseIndex) {
    mod = getRandomInt(1, 1000);
    stdin += `${mod} `
    difficulty = getRandomInt(0, 10);
    switch (difficulty) {
      case 10:
        length = getRandomInt(1, 10000);
        break;
      default:
        length = getRandomInt(1, 20);
        break;
    }
    if (caseNum % 3 == 0 && difficulty == 5) {
      leadingZeroLength = getRandomInt(0, 10);
      while (leadingZeroLength--) {
        stdin += `0`
      }
    }
    while (length--) {
      stdin += getRandomInt(0, 9);
    }
    stdin += `\n`;
  }
  return stdin;

  function getRandomInt(from, to) {
    let res = 0;
    return Math.floor(Math.random() * (to - from + 1)) + from;
  }
}
