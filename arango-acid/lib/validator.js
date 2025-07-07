'use strict';
const Joi = require('joi');

const operationSchema = Joi.object({
  collection: Joi.string().required(),
  action: Joi.string().valid('insert', 'update', 'remove').required(),
  data: Joi.object().required()
});

function validateSchema(schema, operations) {
  operations.forEach(op => {
    const {error} = operationSchema.validate(op);
    if (error) {
      throw error;
    }
  });
  // Additional schema checks can be implemented here using `schema` parameter
  return true;
}

module.exports = { validateSchema };
