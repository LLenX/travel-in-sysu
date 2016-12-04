const myExec = require('./lib/myExec.js');
const {
  cowrapAll
} = require('./utility.js');

module.exports = cowrapAll({
  task
});

function *task(name) {
  let [error, stdout, stderr] = yield myExec(`echo 'Hi, ${name}'`);
  if (error) {
    console.error(stderr);
    throw error;
  }
  return stdout;
}
