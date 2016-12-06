'use strict';
const co = require('co');
module.exports = {
  co,
  addAsyncOn,
  cowrapAll,
  addPropertiesFrom
};

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

function addPropertiesFrom(dest, src, propArr) {
  for (let prop of propArr) {
    if (!src[prop]) continue;
    dest[prop] = src[prop];
  }
}