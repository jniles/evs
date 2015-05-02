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

function Reader(file, type) {
  'use strict';

  type = type || 'text';
  this.type = type;
  this.file = file;

  // initialize the proper reader by type
  switch (type) {
    case 'text':
      this._stream = fs.createReadStream(this.file, { encoding : 'utf8' });
      break;
    default:
      this._stream = '';
      console.error('Type', type, 'not implimented yet.');
  }
}

Reader.prototype.read = function () {
  return this._stream.read();
};

this.module = Reader;
