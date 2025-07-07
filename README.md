
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

📁 Estrutura

arango-acid/

├── lib/

│   ├── executor.js        # Executa transações com rollback automático

│   ├── fkCheck.js         # Simula integridade referencial

│   └── validator.js       # Valida estrutura e schema via Joi

├── routes/
│   └── transaction.js     # Roteia e orquestra chamadas

├── schemas/               # (opcional) Schemas reutilizáveis

├── main.js                # Entrypoint do Foxx

└── manifest.json          # Metadata do serviço



---

📦 Payload de Exemplo

{
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

> Criado por @Honinbou02 com ♥
