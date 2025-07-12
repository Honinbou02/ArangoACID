'use strict';
const createRouter = require('@arangodb/foxx/router');
const db = require('@arangodb').db;

const router = createRouter(); // ✅ só uma vez!

const RELATIONS_COLLECTION = 'relations_config';
if (!db._collection(RELATIONS_COLLECTION)) {
  db._createDocumentCollection(RELATIONS_COLLECTION);
}

const transactionRoutes = require('./routes/transaction');
router.use('/acid', transactionRoutes);

const restfulRoutes = require('./routes/restful');
router.use(restfulRoutes);

const configRoutes = require('./routes/config');
router.use('/config', configRoutes);

module.context.use(router);
