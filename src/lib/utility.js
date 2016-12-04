'use strict';
const co = require('co');
module.exports = { co, addAsyncOn, cowrapAll };

function asyncOn(eventName, gen) {
  let self = this;
  let promisifed = co.wrap(gen);
  self.on(eventName, function() {
    return promisifed.apply(self, arguments).catch((err) => console.error(err));
  });
}

function addAsyncOn(ipc) {
  if (ipc.asyncOn) return;
  ipc['asyncOn'] = asyncOn;  
}

function cowrapAll(obj) {
  for (let key in obj) {
    if (Object.prototype.toString.apply(obj[key]) == '[object GeneratorFunction]') {
      obj[key] = co.wrap(obj[key]);
    }
  }
  return obj;
}
