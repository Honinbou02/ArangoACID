'use strict';
const db = require('@arangodb').db;
const RELATIONS_COLLECTION = 'relations_config';

function execute(operations) {
  const writeCollections = new Set(operations.map(op => op.collection));

  // Verifica se haverá efeitos em outras coleções por cascade
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

      // Executa operações primárias
      const toDelete = [];

      params.operations.forEach(op => {
        const col = db._collection(op.collection);
        if (!col) throw new Error(`Collection ${op.collection} not found`);

        if (op.action === 'insert') {
          results.push(col.save(op.data));
        } else if (op.action === 'update') {
          results.push(col.update(op.data._key, op.data));
        } else if (op.action === 'remove') {
          // Busca dependentes (cascade)
          if (cfg) {
            try {
              const cfgDoc = cfg.firstExample({ _key: op.collection });
              (cfgDoc.relations || []).forEach(rule => {
                if (rule.onDelete === 'cascade') {
                  const refCol = db._collection(rule.refCollection);
                  if (refCol) {
                    const dependents = refCol.byExample({
                      [rule.refField]: op.data._key
                    }).toArray();

                    dependents.forEach(doc => {
                      toDelete.push({
                        collection: rule.refCollection,
                        key: doc._key
                      });
                    });
                  }
                }
              });
            } catch (_) {}
          }

          // Marca para remoção ao final
          results.push(col.remove(op.data._key));
        }
      });

      // Agora remove os filhos (cascade)
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
