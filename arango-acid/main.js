'use strict';
const createRouter = require('@arangodb/foxx/router');
const router = createRouter();

const transactionRoutes = require('./routes/transaction');
router.use('/acid', transactionRoutes);

module.context.use(router);
