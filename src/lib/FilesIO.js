'use strict';
const isWin32 = ~process.platform.indexOf('win32');
let path = require('path');
path = (isWin32 ? path.win32 : path);
const fs = require('fs');

const FilesIO = {
  "read": function(filepath, encoding) {
    const self = this;
    if (encoding === undefined) {
      encoding = 'utf-8';
    }
    return self.stat(path.normalize(filepath)).then((stat) => {
      return new Promise((resolve, reject) => {
        fs.readFile(path.normalize(filepath), encoding, (err, rawData) => {
            if (err) {
              return reject(err);
            } else {
              if (encoding == 'utf-8' && typeof(rawData) == 'string' && isWin32) {
                rawData = rawData.replace(/\r\n/g, '\n');
              }
              return resolve(rawData);
            }
        });
      });
    });
  },

  "write": function(filepath, data, encoding) {
    const self = this;
    if (encoding === undefined) {
      encoding = 'utf-8';
    }
    return self.mkdir(path.dirname(filepath)).then(() => {
      return new Promise((resolve, reject) => {
        if (encoding == 'utf-8' && typeof(rawData) == 'string' && isWin32) {
          data = data.replace(/\n/g, '\r\n');
        }
        fs.writeFile(path.normalize(filepath), data, encoding, (err) => {
            if (err) {
              return reject(err);
            }
            return resolve(self);
        });
      });
    });
  },

  "create": function(filepath, data, overwrite, encoding) {
    const self = this;
    if (overwrite) {
      return self.write(filepath, data, encoding);
    }
    return self.stat(filepath).catch((err) => {
      if (err.code != 'ENOENT') {
        return Promise.reject(err);
      }
      // err.code == 'ENOENT' => if files doesn't exist
      return self.write(filepath, data, encoding);
    });
  },

  "stat": function(filepath) {
    const self = this;
    return new Promise((resolve, reject) => {
      fs.stat(path.normalize(filepath), (err, stat) => {
          if (err) {
            err['stat'] = stat;
            return reject(err);
          } else {
            return resolve(stat);
          }
      });
    });
  },

  "mkdir": function(dirpath) {
    const self = this;
    return new Promise((resolve, reject) => {
      fs.mkdir(dirpath, (err) => {
          if (err) {
            if (err.code == 'ENOENT') {
              return resolve(self.mkdir( path.dirname(dirpath + '1.js') )
                                   .then(() => self.mkdir(dirpath))
                            );
            } else if (err.code == 'EEXIST') {
              return resolve(dirpath);
            } else {
              return reject(err);
            }
          }
          return resolve(dirpath);
      });
    });
  }
};

(function exportModuleUniversally(root, factory) {
  if (typeof(exports) === 'object' && typeof(module) === 'object')
    module.exports = factory();
  else if (typeof(define) === 'function' && define.amd)
    define(factory);
  /* amd  // module name: diff
    define([other dependent modules, ...], function(other dependent modules, ...)) {
      return exported object;
    });
    usage: require([required modules, ...], function(required modules, ...) {
      // codes using required modules
    });
  */
  else if (typeof(exports) === 'object')
    exports['FilesIO'] = factory();
  else
    root['FilesIO'] = factory();
})(this, function factory() {
  return FilesIO;
});
