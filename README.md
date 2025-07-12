# 🇧🇷 ArangoACID    [🇺🇸 English Version](README.md)

> Camada transacional ACID-like para ArangoDB — powered by Foxx Microservices

O **ArangoACID** é um microserviço genérico, reutilizável e open-source que fornece uma camada de transações atômicas, validação de integridade relacional ("chaves estrangeiras") e suporte a deleção em cascata — tudo sem precisar sair do seu banco ArangoDB.

Ideal para quem precisa de consistência, rollback seguro e estrutura de dados relacional mesmo em ambiente multimodelo.

---

## 🆕 Novidades da versão 1.1

✅ Endpoints RESTful automáticos para qualquer coleção:

* `POST /arango-acid/api/NOMEDACOLECTION`
* `PUT /arango-acid/api/NOMEDACOLECTION/_key`
* `DELETE /arango-acid/api/NOMEDACOLECTION/_key`

✅ Validação de chaves estrangeiras (FK) para inserções e updates

✅ Deleção em cascata (cascade delete) respeitando `onDelete: "cascade"`

✅ Validação de estrutura via Joi embutida no fluxo

✅ Transações seguras com rollback automático se qualquer passo falhar

✅ Sem dependência externa, 100% via Foxx microservice

---

## ⚙️ Instalação

### Pelo Painel Web do ArangoDB:

1. Acesse **Services (Foxx)**
2. Clique em **Upload**
3. Faça upload da pasta ou `.zip` do serviço `arango-acid`
4. O endpoint será acessível em `/arango-acid`

### Pela Foxx CLI:

```bash
foxx install ./arango-acid /arango-acid
```

---

## 📁 Estrutura do Projeto

```
arango-acid/
├── lib/
│   ├── executor.js        # Executa operações com rollback
│   ├── fkCheck.js         # Checagem de integridade relacional
│   └── validator.js       # Valida schema com Joi
│
├── routes/
│   └── api.js             # Endpoints dinâmicos REST por coleção
│
├── schemas/               # Schemas Joi reutilizáveis (opcional)
│
├── main.js                # Entrypoint do microserviço
└── manifest.json          # Metadata do Foxx
```

---

## 🔗 Endpoints RESTful

Após instalar, você pode usar endpoints automáticos com transação embutida:

```bash
# Inserir documento na coleção "users"
curl -u root:SENHA \
  -X POST https://host/_db/_system/arango-acid/api/users \
  -H "Content-Type: application/json" \
  -d '{"_key": "123", "name": "Tesla"}'

# Atualizar documento
curl -u root:SENHA \
  -X PUT https://host/_db/_system/arango-acid/api/users/123 \
  -H "Content-Type: application/json" \
  -d '{"name": "Nikola Tesla"}'

# Deletar com cascade (se configurado)
curl -u root:SENHA \
  -X DELETE https://host/_db/_system/arango-acid/api/users/123
```

Todas as operações usam transações ACID-like e rollback automático.

---

## 🧠 Regras de Integridade Relacional (FKs)

As "chaves estrangeiras" são definidas na coleção especial `relations_config`:

```json
{
  "_key": "posts",
  "relations": [
    {
      "localField": "author",
      "refCollection": "users",
      "refField": "_key",
      "onDelete": "cascade"
    }
  ]
}
```

Esse exemplo define:

* A coleção `posts` tem um campo `author`
* Ele faz referência a `_key` da coleção `users`
* Se um `user` for deletado, os `posts` dele também são removidos

Você pode adicionar as configurações manualmente no ArangoDB ou via API `/config/relations` (a ser implementada).

---

## 📃 Payload Completo (via `/acid` ou interno)

```json
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
        "_key": "123",
        "name": "Tesla",
        "email": "tesla@arango.dev"
      }
    },
    {
      "collection": "posts",
      "action": "insert",
      "data": {
        "_key": "post1",
        "author": "123",
        "content": "Post 1"
      }
    }
  ]
}
```

---

## 🔒 O que é validado?

| Validação                     | Como funciona                                                |
| ----------------------------- | ------------------------------------------------------------ |
| Validação de Schema Joi       | Define estrutura dos dados esperados (tipos, required, etc)  |
| Validação de FK (foreign key) | Busca documentos referenciados e valida sua existência       |
| Cascade Delete                | Apaga filhos automaticamente com base no `onDelete: cascade` |
| Transação ACID-like           | Todas as operações são rollbackadas se algo falhar           |

---

## 🧠 Por que usar o ArangoACID?

* Arango não tem integridade relacional nativa
* Também não valida schema sem escrever código manual
* Falta controle de rollback para operações REST

O ArangoACID resolve tudo isso de forma **centralizada, reusável e robusta**.

---

## 🧪 Futuro do Projeto

* 🔐 **Autenticação OAuth2/JWT integrada**
  Suporte nativo a controle de acesso via tokens (por header ou cookie), com permissões por collection e por operação.
* 🔁 **Indexação e validação por AQL customizado**
  Inclusão de validações declarativas com AQL para regras de negócio complexas, permitindo checks dinâmicos antes de commits.
* 🧱 **Logs transacionais e replay de eventos**
  Gravação opcional de cada transação em uma collection de histórico (`_acid_logs`) para auditoria, debugging ou reprocessamento.
* ⚙️ **Interface visual para configuração de relações**
  Mini dashboard em React ou Vue embutido no painel do Foxx para editar a `relations_config` com visualização gráfica.
* 🧪 **Testes unitários e integração via Mocha/Chai**
  Testes formais para cada etapa: schema, executor, integridade relacional, rollback e endpoints REST.
* 📦 **Compatibilidade total com CI/CD**
  Exportação automática dos endpoints e configs para ambientes Docker/Kubernetes, integrando com pipelines.
* 🌐 **Versão GraphQL experimental**
  Exposição de uma camada opcional de GraphQL com validações e resolvers conectados à lógica transacional.

---

## 📖 Licença

Apache 2.0 — uso livre, contribuições são bem-vindas.

---

> Criado com ❤️ por @Honinbou02
