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

// Valida chaves estrangeiras
function check(rules, docs) {
  // Caso legado: check(foreignKeys)
  if (docs === undefined) {
    const foreignKeys = rules;
    if (!foreignKeys) return true;

    foreignKeys.forEach(fk => {
      const col = db._collection(fk.refCollection);
      if (!col) throw new Error(`Collection ${fk.refCollection} not found`);
      const exists = col.firstExample(fk.refField, fk.value);
      if (!exists) {
        throw new Error(`Foreign key violation on ${fk.refCollection} → ${fk.refField} = ${fk.value}`);
      }
    });

    return true;
  }

  // Novo modo: check(rules, docs)
  const fkRules = rules || [];
  const documents = docs || [];

  documents.forEach(doc => {
    fkRules.forEach(rule => {
      const value = doc[rule.localField];
      if (value === undefined) return;

      const col = db._collection(rule.refCollection);
      if (!col) throw new Error(`Collection ${rule.refCollection} not found`);
      const exists = col.firstExample(rule.refField, value);
      if (!exists) {
        throw new Error(`Foreign key violation on ${rule.refCollection} → ${rule.refField} = ${value}`);
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

module.exports = { check, checkFromConfig };
