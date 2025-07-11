'use strict';
const createRouter = require('@arangodb/foxx/router');
const db = require('@arangodb').db;
const Joi = require('joi');
const validator = require('../lib/validator');
const fkCheck = require('../lib/fkCheck');
const executor = require('../lib/executor');

const router = createRouter();
router.tag('restful');

// ⚠️ db._collectionNames() não funciona no Foxx runtime
// ✅ Usamos _collections().map(...).filter(...) como alternativa segura
const collectionNames = db._collections()
  .map(c => c.name())
  .filter(n => !n.startsWith('_'));

collectionNames.forEach(name => {
  const base = `/api/${name}`;

  // GET /api/nome_da_collection → Lista todos os documentos
  router.get(base, function (req, res) {
    const col = db._collection(name);
    if (!col) res.throw(404, 'Collection not found');
    res.send(col.all().toArray());
  }).summary(`List ${name}`)
    .description(`List documents from ${name}`);

  // GET /api/nome_da_collection/:key → Busca documento por chave
  router.get(`${base}/:key`, function (req, res) {
    const col = db._collection(name);
    if (!col) res.throw(404, 'Collection not found');
    const key = req.pathParams.key;
    if (!col.exists(key)) res.throw(404, 'Document not found');
    res.send(col.document(key));
  }).pathParam('key', Joi.string().required(), 'Document key')
    .summary(`Get ${name} by key`)
    .description(`Return a single document from ${name}`);

  // POST /api/nome_da_collection → Insere documento com transação
  router.post(base, function (req, res) {
    const data = req.body;
    let schema = {};
    try { schema = require(`../schemas/${name}`); } catch (e) {}
    const ops = [{ collection: name, action: 'insert', data }];
    validator.validateSchema(schema, ops);
    fkCheck.check();
    const result = executor.execute(ops);
    res.send(result[0]);
  }).body(Joi.object().required(), `Document to insert in ${name}`)
    .summary(`Insert into ${name}`)
    .description(`Insert a document into ${name} using transactional executor`);

  // PUT /api/nome_da_collection/:key → Atualiza documento com transação
  router.put(`${base}/:key`, function (req, res) {
    const data = Object.assign({}, req.body, { _key: req.pathParams.key });
    let schema = {};
    try { schema = require(`../schemas/${name}`); } catch (e) {}
    const ops = [{ collection: name, action: 'update', data }];
    validator.validateSchema(schema, ops);
    fkCheck.check();
    const result = executor.execute(ops);
    res.send(result[0]);
  }).pathParam('key', Joi.string().required(), 'Document key')
    .body(Joi.object().required(), `Document update for ${name}`)
    .summary(`Update ${name}`)
    .description(`Update a document in ${name} using transactional executor`);

  // DELETE /api/nome_da_collection/:key → Remove documento com transação
  router.delete(`${base}/:key`, function (req, res) {
    const data = { _key: req.pathParams.key };
    const ops = [{ collection: name, action: 'remove', data }];
    validator.validateSchema({}, ops);
    fkCheck.check();
    const result = executor.execute(ops);
    res.send(result[0]);
  }).pathParam('key', Joi.string().required(), 'Document key')
    .summary(`Remove from ${name}`)
    .description(`Delete a document from ${name} using transactional executor`);
});

module.exports = router;
