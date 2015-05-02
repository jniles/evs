#!/usr/bin/iojs --harmony-arrow-functions
// cmd.js
//
// Command line interface to the email validator
//
// Date : May 1, 2015
// Author: jniles
// License : GPLv3
//
// jshint esnext: true

var path   = require('path'),
    Reader = require('./Reader'),
    evs  = require('./evs'),
    lib  = require('./lib'),
    file = process.argv[2];

var data = new Reader(file),
    emails = data.read();

// iterate through list, solving all promises
// as you go
lib.settlePromises(emails.map(function (addr) {
  return evs(addr);
}))
.then(function (array) {
  console.log('All promises settled', array); 
})
.catch(function (reason) {
  console.error('settlePromises errored for this reason:', reason);
});
