'use strict';
const createRouter = require('@arangodb/foxx/router');
const router = createRouter();

const transactionRoutes = require('./routes/transaction');
router.use('/acid', transactionRoutes);

const restfulRoutes = require('./routes/restful');
router.use(restfulRoutes);

module.context.use(router);
