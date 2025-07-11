'use strict';
const db = require('@arangodb').db;

function check(rules, docs) {
  // Legacy call signature: check(foreignKeys)
  if (docs === undefined) {
    const foreignKeys = rules;
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

  const fkRules = rules || [];
  const documents = docs || [];
  documents.forEach(doc => {
    fkRules.forEach(rule => {
      const value = doc[rule.localField];
      if (value === undefined) {
        return;
      }
      const col = db._collection(rule.refCollection);
      if (!col) {
        throw new Error(`Collection ${rule.refCollection} not found`);
      }
      const exists = col.firstExample(rule.refField, value);
      if (!exists) {
        throw new Error(
          `Foreign key violation on ${rule.refCollection}`
        );
      }
    });
  });
  return true;
}

module.exports = { check };
