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

var Reader = require('./Reader'),
    path   = require('path'),
    evs  = require('./evs'),
    file = process.argv[2];

var data = new Reader(file),
    emails = data.read();

Promise.all(emails.map(function (email) {
    return evs(email);
  }))
  .then(console.log)
  .catch(console.error);
