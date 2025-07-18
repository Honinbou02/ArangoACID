'use strict';
const createRouter = require('@arangodb/foxx/router');
const Joi = require('joi');
const validator = require('../lib/validator');
const fkCheck = require('../lib/fkCheck');
const executor = require('../lib/executor');

const router = createRouter();
router.tag('transaction');

const payloadSchema = Joi.object({
  schema: Joi.object().required(),
  operations: Joi.array().items(Joi.object()).required(),
  foreignKeys: Joi.array().items(Joi.object()).optional()
}).required();

router.post('/transaction', function (req, res) {
  try {
    const payload = req.body;

    // Validação de schema
    validator.validateSchema(payload.schema, payload.operations);

    // Validação de FKs
    if (payload.foreignKeys) {
      fkCheck.check(payload.foreignKeys);
    } else {
      payload.operations.forEach(op => {
        if (op.action !== 'remove') {
          fkCheck.checkFromConfig(op.collection, [op.data]);
        }
      });
    }

    // Executa transação
    const result = executor.execute(payload.operations);
    res.send(result);
  } catch (err) {
    res.throw('bad request', err.message);
  }
})
.body(payloadSchema, 'Operations to execute atomically')
.response(200, Joi.object().required(), 'Result of transaction')
.summary('Run ACID transaction')
.description('Validates and executes operations inside an atomic transaction.');

module.exports = router;
