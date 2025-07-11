# ArangoACID

ArangoACID is a Foxx microservice providing transactional write capabilities for ArangoDB.

## Installation

Use the Foxx CLI to install the service:

```bash
foxx install ./arango-acid /arango-acid
```

## Example Payload

```json
{
  "schema": {},
  "operations": [
    {"collection": "users", "action": "insert", "data": {"_key": "bob", "name": "Bob"}}
  ],
  "foreignKeys": [
    {"refCollection": "roles", "refField": "_key", "value": "admin"}
  ]
}
```

## RESTful API

After installation the service exposes dynamic REST endpoints based on your
existing collections. Example usage:

```bash
# insert a new document into collection "users"
curl -X POST /arango-acid/api/users -d '{"name":"Tesla"}'

# update a document
curl -X PUT /arango-acid/api/users/123 -d '{"email":"new@mail.com"}'
```

All write operations use the same transactional engine as the `/acid` endpoint
and will rollback on failure.

### Referential integrity

Foreign key rules are stored in the `__relations_config__` collection. Each
document uses the collection name as `_key` and lists its rules in the
`relations` array:

```js
{
  "_key": "users",
  "relations": [
    { "localField": "role", "refCollection": "roles", "refField": "_key" }
  ]
}
```
If no configuration exists for a collection the checks are skipped. You can
manage these documents manually or via the `/config/relations` API. See
`docs/setup-relations.md` for details.

### Referential integrity

To automatically validate foreign keys on the REST API, define rules in
`lib/relations.js`. Each collection may list relations to other collections:

```js
module.exports = {
  users: [
    { localField: 'role', refCollection: 'roles', refField: '_key' }
  ]
};
```

If no rules are defined for a collection the checks are skipped.

# 🔐 ArangoACID

> ACID-like transactional layer for ArangoDB — powered by Foxx Microservices

ArangoACID é um microserviço genérico e reutilizável que simula transações seguras, validadas por schema e com checagem de integridade relacional no ArangoDB. Ideal para aplicações que precisam de mais **controle de consistência**, sem abandonar o poder do modelo multimodelo.

---

## ⚙️ Instalação

Via painel web do ArangoDB:

1. Vá em **Services** (Foxx)
2. Clique em **Upload**
3. Faça upload da pasta compactada `arango-acid.zip`
4. O endpoint `/acid/transaction` estará disponível

Ou via CLI:

bash
foxx install /acid /caminho/para/arango-acid


---

<h3>📁 Estrutura</h3>

<pre><code>arango-acid/
├── lib/
│   ├── executor.js      → Executa transações com rollback automático
│   ├── fkCheck.js       → Simula integridade referencial
│   └── validator.js     → Valida estrutura e schema via Joi
│
├── routes/
│   └── transaction.js   → Roteia e orquestra chamadas
│
├── schemas/             → (opcional) Schemas reutilizáveis
│
├── main.js              → Entrypoint do Foxx
└── manifest.json        → Metadata do serviço
</code></pre>

---

<h3>📦 Payload de Exemplo</h3>

<pre><code>{
  "schema": {
    "users": {
      "name": "string",
      "email": "string"
    }
  },
  "operations": [
    {
      "collection": "users",
      "action": "insert",
      "data": {
        "name": "Tesla",
        "email": "tesla@arango.dev"
      }
    }
  ],
  "foreignKeys": [
    {
      "refCollection": "roles",
      "refField": "_key",
      "value": "admin"
    }
  ]
}
</code></pre>

---

🔐 O que é validado?

✅ Estrutura das operações (collection, action, data)

✅ Schema via Joi para validar tipo e formato

✅ Checagem de "chaves estrangeiras" (simulada via firstExample)

✅ Execução 100% atômica com rollback se algo falhar



---

🧠 Por que isso importa?

ArangoDB é poderoso, mas falta uma camada de:

Schema Validation robusta

Garantia de rollback total

Simulação de integridade relacional


Este microserviço oferece isso sem mudar seu banco, nem abandonar performance.


---

🧪 Futuro

🔄 Versões RESTful por coleção (auto-generators)

🔐 Modo de autenticação OAuth2 (já incluso no Foxx)

🔁 Indexação automática com AQL validators

---

📜 Licença

Apache 2.0 — open-source e aberto para contribuições.

---

> Criado por @Honinbou02 com 💙
