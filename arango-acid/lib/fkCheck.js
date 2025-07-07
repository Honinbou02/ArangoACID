'use strict';
const db = require('@arangodb').db;

function check(foreignKeys) {
  if (!foreignKeys) {
    return true;
  }
  foreignKeys.forEach(fk => {
    const col = db._collection(fk.refCollection);
    if (!col) {
      throw new Error(`Collection ${fk.refCollection} not found`);
    }
    const exists = col.firstExample(fk.refField, fk.value);
    if (!exists) {
      throw new Error(`Foreign key violation on ${fk.refCollection}`);
    }
  });
  return true;
}

module.exports = { check };
