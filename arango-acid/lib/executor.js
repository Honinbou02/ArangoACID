'use strict';
const db = require('@arangodb').db;
const RELATIONS_COLLECTION = 'relations_config';

function execute(operations) {
  const collections = {
    write: Array.from(new Set(operations.map(op => op.collection))),
    read: [RELATIONS_COLLECTION]
  };

  return db._executeTransaction({
    collections,
    params: { operations },
    action: function (params) {
      const db = require('@arangodb').db;
      const cfg = db._collection(RELATIONS_COLLECTION);
      const results = [];
      const toDelete = [];

      const relationMap = {};
      const relationDocs = cfg.all().toArray();
      relationDocs.forEach(doc => {
        (doc.relations || []).forEach(rel => {
          if (!relationMap[rel.refCollection]) relationMap[rel.refCollection] = [];
          relationMap[rel.refCollection].push({
            source: doc._key, // collection filha
            localField: rel.localField,
            refField: rel.refField,
            onDelete: rel.onDelete
          });
        });
      });

      params.operations.forEach(op => {
        const col = db._collection(op.collection);
        if (!col) throw new Error(`Collection ${op.collection} not found`);

        if (op.action === 'insert') {
          results.push(col.save(op.data));
        } else if (op.action === 'update') {
          results.push(col.update(op.data._key, op.data));
        } else if (op.action === 'remove') {
          // Verifica se outras collections dependem dessa
          const dependents = relationMap[op.collection] || [];
          dependents.forEach(rel => {
            if (rel.onDelete === 'cascade') {
              const refCol = db._collection(rel.source);
              if (refCol) {
                const matches = refCol.byExample({
                  [rel.localField]: op.data[rel.refField]
                }).toArray();

                matches.forEach(doc => {
                  toDelete.push({
                    collection: rel.source,
                    key: doc._key
                  });
                });
              }
            }
          });

          results.push(col.remove(op.data._key));
        }
      });

      toDelete.forEach(rem => {
        const col = db._collection(rem.collection);
        if (col) {
          results.push(col.remove(rem.key));
        }
      });

      return results;
    }
  });
}

module.exports = { execute };
