// Reader.js
//
// Helper for evs.js to read various input formats
// Currently supported:
//  - text
//
// Date: May 1, 2015
// Author: jniles
// License : GPLv3
//
// jshint esnext: true
var fs = require('fs');

function Reader(file, type) {
  'use strict';

  this.file = file;
  type = type || 'text';
  this.type = type;

  // initialize the proper reader by type
  switch (type) {
    case 'text':
      console.log('Opening read stream', this.file);
      this._stream = fs.readFileSync(this.file, 'utf8');
      break;
    default:
      this._stream = '';
      console.error('Type', type, 'not implimented yet.');
      break;
  }
}

Reader.prototype.read = function () {
  var data = this._stream;
  data = data.split('\n');
  return data.filter(function (s) { return s === ''; });
};

module.exports = Reader;
