'use strict';
const db = require('@arangodb').db;
const RELATIONS_COLLECTION = 'relations_config';

// Busca regras de FK a partir da config
function getRules(collectionName) {
  const cfg = db._collection(RELATIONS_COLLECTION);
  if (!cfg) return [];
  try {
    const doc = cfg.firstExample({ _key: collectionName });
    return doc.relations || [];
  } catch (e) {
    return [];
  }
}

// Valida chaves estrangeiras (modo legado ou novo)
function check(rules, docs) {
  // Modo legado: check(foreignKeys)
  if (docs === undefined) {
    const foreignKeys = rules;
    if (!foreignKeys) return true;

    foreignKeys.forEach(fk => {
      // ignora regras de cascade
      if (fk.onDelete === 'cascade') return;

      const col = db._collection(fk.refCollection);
      if (!col) throw new Error(`Collection ${fk.refCollection} not found`);

      const valueStr = String(fk.value);
      const found = col.byExample({ [fk.refField]: valueStr }).toArray();
      if (found.length === 0) {
        throw new Error(`Foreign key violation on ${fk.refCollection} → ${fk.refField} = ${valueStr}`);
      }
    });

    return true;
  }

  // Novo modo: check(rules, docs)
  const fkRules = (rules || []).filter(rule => rule.onDelete !== 'cascade');
  const documents = docs || [];

  documents.forEach(doc => {
    fkRules.forEach(rule => {
      if (!doc.hasOwnProperty(rule.localField)) return;

      const value = doc[rule.localField];
      const valueStr = String(value);

      const col = db._collection(rule.refCollection);
      if (!col) throw new Error(`Collection ${rule.refCollection} not found`);

      const found = col.byExample({ [rule.refField]: valueStr }).toArray();
      if (found.length === 0) {
        throw new Error(`Foreign key violation on ${rule.refCollection} → ${rule.refField} = ${valueStr}`);
      }
    });
  });

  return true;
}

// Valida FKs baseado na config central
function checkFromConfig(collectionName, docs) {
  const rules = getRules(collectionName);
  return check(rules, docs);
}

module.exports = { check, checkFromConfig, getRules };
