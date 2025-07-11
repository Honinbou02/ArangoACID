'use strict';
const createRouter = require('@arangodb/foxx/router');
const db = require('@arangodb').db;
const Joi = require('joi');
const router = createRouter();
router.tag('relations config');

const RELATIONS_COLLECTION = '__relations_config__';

router.get('/relations', function (req, res) {
  const col = db._collection(RELATIONS_COLLECTION);
  if (!col) return res.send([]);
  res.send(col.all().toArray());
}).summary('List relations');

const relationSchema = Joi.object({
  _key: Joi.string().required(),
  relations: Joi.array().items(
    Joi.object({
      localField: Joi.string().required(),
      refCollection: Joi.string().required(),
      refField: Joi.string().required()
    })
  ).required()
}).required();

router.post('/relations', function (req, res) {
  const col = db._collection(RELATIONS_COLLECTION);
  const data = req.body;
  col.save(data);
  res.send(data);
}).body(relationSchema, 'Relation configuration');

router.put('/relations/:key', function (req, res) {
  const col = db._collection(RELATIONS_COLLECTION);
  const key = req.pathParams.key;
  const data = Object.assign({}, req.body, { _key: key });
  if (!col.exists(key)) res.throw(404, 'Relation not found');
  col.replace(key, data);
  res.send(data);
}).pathParam('key', Joi.string().required(), 'Config key')
  .body(relationSchema, 'Relation configuration');

router.delete('/relations/:key', function (req, res) {
  const col = db._collection(RELATIONS_COLLECTION);
  const key = req.pathParams.key;
  if (!col.exists(key)) res.throw(404, 'Relation not found');
  col.remove(key);
  res.send({ success: true });
}).pathParam('key', Joi.string().required(), 'Config key');

module.exports = router;
