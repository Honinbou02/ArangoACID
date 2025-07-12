'use strict';
const createRouter = require('@arangodb/foxx/router');
const db = require('@arangodb').db;
const router = createRouter(); // ✅ só uma vez

const RELATIONS_COLLECTION = 'relations_config';

// Criação da collection se não existir
if (!db._collection(RELATIONS_COLLECTION)) {
  db._createDocumentCollection(RELATIONS_COLLECTION);
}

// Seed de exemplo se estiver vazia
if (db._collection(RELATIONS_COLLECTION).count() === 0) {
  db._collection(RELATIONS_COLLECTION).save({
    _key: 'example',
    description: 'Exemplo de configuração de relações para uso com validação de chave estrangeira.',
    relations: [
      {
        localField: 'exemplo_id',
        refCollection: 'outra_collection',
        refField: '_key'
      }
    ],
    note: 'Duplique este documento e renomeie o _key para sua collection real. Ex: "users", "pedidos", etc.'
  });
}

const transactionRoutes = require('./routes/transaction');
router.use('/acid', transactionRoutes);

const restfulRoutes = require('./routes/restful');
router.use(restfulRoutes);

const configRoutes = require('./routes/config');
router.use('/config', configRoutes);

module.context.use(router);
