'use strict';
const db = require('@arangodb').db;
const RELATIONS_COLLECTION = 'relations_config';

function execute(operations) {
  // Coletar todas as coleções diretamente usadas nas operações
  const writeCollections = new Set(operations.map(op => op.collection));

  // Detectar possíveis coleções afetadas por delete cascade
  try {
    const cfg = db._collection(RELATIONS_COLLECTION);
    operations.forEach(op => {
      if (op.action === 'remove') {
        try {
          const cfgDoc = cfg.firstExample({ _key: op.collection });
          (cfgDoc.relations || []).forEach(rule => {
            if (rule.onDelete === 'cascade') {
              writeCollections.add(rule.refCollection);
            }
          });
        } catch (_) {}
      }
    });
  } catch (_) {}

  const collections = {
    write: Array.from(writeCollections),
    read: [RELATIONS_COLLECTION]
  };

  return db._executeTransaction({
    collections,
    params: { operations },
    action: function (params) {
      const db = require('@arangodb').db;
      const cfg = db._collection(RELATIONS_COLLECTION);
      const results = [];
      const cascade = [];

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
          if (cfg) {
            try {
              const cfgDoc = cfg.firstExample({ _key: op.collection });
              (cfgDoc.relations || []).forEach(rule => {
                if (rule.onDelete === 'cascade') {
                  const refCol = db._collection(rule.refCollection);
                  if (refCol) {
                    const found = refCol.byExample({ [rule.refField]: op.data._key }).toArray();
                    found.forEach(child => {
                      cascade.push({ collection: rule.refCollection, key: child._key });
                    });
                  }
                }
              });
            } catch (_) {}
          }
          results.push(col.remove(op.data._key));
        }
      });

      cascade.forEach(rem => {
        const c = db._collection(rem.collection);
        if (c) {
          results.push(c.remove(rem.key));
        }
      });

      return results;
    }
  });
}

module.exports = { execute };
