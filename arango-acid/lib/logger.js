'use strict';
const db = require('@arangodb').db;
const COLLECTION = 'transaction_log';
let col = db._collection(COLLECTION);
if (!col) {
  col = db._create(COLLECTION);
}

function log(entry) {
  col.save(Object.assign({ timestamp: Date.now() }, entry));
}

module.exports = { log };
