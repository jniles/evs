// evs.js (Email Validating Service)
//
// ev.js is a tool that uses NodeJS to validate whether an email adddress
// exists or not.  It does so by pinging the mail exchange server and asks
// if it has registered an email address with that particular identity.
//
// Date : May 1, 2015
// Author: jniles
// License : GPLv3
//
// jshint esnext: true

var dns = require('dns'),
    net = require('net'),
    Reader = require('./Reader');

// utilities

// creates an interator from an array
function* iter(array) {
  for (var i = 0; i < array.length; i++) {
    yield array[i];
  }
}

// methods

// provided an email address, will return either the
// domain of the mail server, or error if the domain server
// does not exist.
function getDomains(address) {
  'use strict';
  return new Promise(function (resolve, reject) {

    // parse the domain
    var domain = address.split('@')[1];

    // resolve the mail exchange server
    dns.resolveMx(domain, function (error, domains) {
      if (error) { reject(error); }

      // sort the domains in ascending order of priority
      domains.sort(function (a, b) { return a.priority > b.priority; });
      resolve(domains);
    });
  });
}


// runs a domain query
//
// there are four possible outcomes for this query:
// 1) success => resolve { valid : true }
// 2) failure => resolve { valid : false }
// 3) uncertain => resolve { valid : 'unknown' }
// 4) error => reject { error : error }
function queryDomain(domain, email, timeout) {
  'use strict';

  var client,
      port = 25,
      server = domain.exchange;

  console.log('Calling query domain with', arguments);

  var cmd = iter([
    'helo ' + server,
    'mail from: <' + email + '>',
    'rcpt to: <' + email + '>'
  ]);

  return new Promise(function (resolve, reject) {
    client = net.createConnection(25, server);
    client.setEncoding('ascii');
    client.setTimeout(timeout);

    function cleanup() {
      console.log('Cleaning up...');
      client.removeAllListeners();
      client.destroy();
    }

    // if error, escape to universal error
    client.on('error', function (data) {
      reject(data);
      cleanup();
    });

    client.on('success', function () {
      resolve({ valid : true });
      cleanup();
    });

    client.on('uncertain', function () {
      resolve({ valid : 'unknown' });
      cleanup();
    });

    // register uncertain event in case of timeout
    client.on('timeout', () =>  client.emit('uncertain'));

    client.on('connect', function () {
      console.log('Client connected!', res);
      client.on('prompt', function () {

        // get the next command
        var command = cmd.next();

        // if the task is complete, emit success event
        if (command.done) {
          client.emit('success');
          return;
        }

        // windows-style endings for hotmail addresses
        client.write(command);
        client.write('\r\n');
        console.log('Sent command:', command);
      });

      client.on('data', function (res) {
        console.log('client got data:', res);
        if (res.indexOf("220") === 0 || res.indexOf("250") === 0 ||
            res.indexOf("\n220") !== -1 || res.indexOf("\n250") !== -1) {
          conn.emit('prompt');
        } else if (res.indexOf("\n550") !== -1 || res.indexOf("550") === 0) {
          conn.emit('failure');
        } else {
          conn.emit('uncertain');
        }
      });
    });
  });
}

// main script runner
function main(email, timeout, autoretry) {
  'use strict';

  // three second timeout for client connections
  // default : 7 seconds
  timeout = timeout || 7000;

  // try the next domain if the highest priority times out
  // default : false
  autoretry = autoretry || false;

  var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

  return new Promise(function (resolve, reject) {

    // first test that an email address is properly formed via regular expressions
    if (!re.test(email)) {
      reject(false);
    }

    // now we can try to test the email address versus external mail servers
    var resolution = getDomains(email)
      .then((domains) => queryDomain(domains[0], email, timeout));

    // reject or resolve depending on the result of the previous query
    resolution.then(() => resolve(arguments)).catch(() => reject(arguments));
  });
}

module.exports = main;
