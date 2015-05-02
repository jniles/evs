// lib.js
//
// library functions used in the evs mail
// service
//
// Date : May 1, 2015
// Author: jniles
// License : GPLv3
//
// jshint esnext: true


// creates an interator from an array
function* iterate(array) {
  for (var i = 0; i < array.length; i++) {
    yield array[i];
  }
}


// similar to q.allSettled.  Returns a fulfilled promise array
// when all the promises have settled, with either a failure
// or a resolution.
function settlePromises(array) {
  var i = array.length,
      results = [];

  return new Promise(function (resolve, reject) {

    // for each promise in the array
    array.forEach(function (promise, idx) {
      promise
        .then(function (value) {
          results[idx] = { status : "resolved", value : value };
          if (--i === 0) { resolve(results); } // decriment counter
        })
        .catch(function (value) {
          results[idx] = { status : "rejected", value : value };
          if (--i === 0) { resolve(results); } // decriment counter
        });
    });

    if (i === 0) {
      resolve(results);
    }
  });
}



// exports
exports.iterate = iterate;
exports.settlePromises = settlePromises;
