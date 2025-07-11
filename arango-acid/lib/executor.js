'use strict';
const db = require('@arangodb').db;

function execute(operations) {
  const collections = { write: [...new Set(operations.map(op => op.collection))] };
  return db._executeTransaction({
    collections,
    params: { operations },
    action: function (params) {
      const db = require('@arangodb').db;
      const results = [];
      params.operations.forEach(op => {
        const col = db._collection(op.collection);
        if (!col) {
          throw new Error(`Collection ${op.collection} not found`);
        }
        if (op.action === 'insert') {
          results.push(col.save(op.data));
        } else if (op.action === 'update') {
          results.push(col.update(op.data._key, op.data));
        } else if (op.action === 'remove') {
          results.push(col.remove(op.data._key));
        }
      });
      return results;
    }
  });
}

module.exports = { execute };
