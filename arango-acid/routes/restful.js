'use strict';

const createRouter = require('@arangodb/foxx/router');
const db = require('@arangodb').db;
const Joi = require('joi');
const validator = require('../lib/validator');
const fkCheck = require('../lib/fkCheck');
const executor = require('../lib/executor');

const router = createRouter();
router.tag('restful');

// Usa lista segura de coleções visíveis
const collectionNames = db._collections()
  .map(c => c.name())
  .filter(n => !n.startsWith('_'));

collectionNames.forEach(name => {
  const base = `/api/${name}`;

  // GET all
  router.get(base, function (req, res) {
    try {
      const col = db._collection(name);
      if (!col) res.throw(404, 'Collection not found');
      res.send(col.all().toArray());
    } catch (err) {
      res.throw(500, err.message);
    }
  }).summary(`List ${name}`)
    .description(`List documents from ${name}`);

  // GET by key
  router.get(`${base}/:key`, function (req, res) {
    try {
      const col = db._collection(name);
      const key = req.pathParams.key;
      try {
        const doc = col.document(key);
        res.send(doc);
      } catch (e) {
        res.throw(404, 'Document not found');
      }
    } catch (err) {
      res.throw(500, err.message);
    }
  }).pathParam('key', Joi.string().required(), 'Document key')
    .summary(`Get ${name} by key`)
    .description(`Return a single document from ${name}`);

  // POST (insert)
  router.post(base, function (req, res) {
    try {
      const data = req.body;
      let schema = {};
      try { schema = require(`../schemas/${name}`); } catch (e) {}
      const ops = [{ collection: name, action: 'insert', data }];
      validator.validateSchema(schema, ops);
      fkCheck.checkFromConfig(name, [data]);
      const result = executor.execute(ops);
      res.send(result[0]);
    } catch (err) {
      res.throw(400, err.message);
    }
  }).body(Joi.object().required(), `Document to insert in ${name}`)
    .summary(`Insert into ${name}`)
    .description(`Insert a document into ${name} using transactional executor`);

  // PUT (update)
  router.put(`${base}/:key`, function (req, res) {
    try {
      const data = Object.assign({}, req.body, { _key: req.pathParams.key });
      let schema = {};
      try { schema = require(`../schemas/${name}`); } catch (e) {}
      const ops = [{ collection: name, action: 'update', data }];
      validator.validateSchema(schema, ops);
      fkCheck.checkFromConfig(name, [data]);
      const result = executor.execute(ops);
      res.send(result[0]);
    } catch (err) {
      res.throw(400, err.message);
    }
  }).pathParam('key', Joi.string().required(), 'Document key')
    .body(Joi.object().required(), `Document update for ${name}`)
    .summary(`Update ${name}`)
    .description(`Update a document in ${name} using transactional executor`);

  // DELETE
  router.delete(`${base}/:key`, function (req, res) {
    try {
      const data = { _key: req.pathParams.key };
      const ops = [{ collection: name, action: 'remove', data }];
      validator.validateSchema({}, ops);
      fkCheck.checkFromConfig(name, [data]);
      const result = executor.execute(ops);
      res.send(result[0]);
    } catch (err) {
      res.throw(400, err.message);
    }
  }).pathParam('key', Joi.string().required(), 'Document key')
    .summary(`Remove from ${name}`)
    .description(`Delete a document from ${name} using transactional executor`);
});

module.exports = router;
