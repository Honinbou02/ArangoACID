# ArangoACID    [🇧🇷 Versão em pt-br](README-Br.md)

---

> ACID-like transactional layer for ArangoDB — powered by Foxx Microservices

**ArangoACID** is a generic, reusable, and open-source Foxx microservice that provides atomic transaction support, foreign key integrity simulation, and cascade delete — all within your ArangoDB instance.

Perfect for applications that require consistency, safe rollback, and relational data behavior in a multimodel environment.

---

## 🆕 What’s New in Version 1.1

✅ Automatic RESTful endpoints for any collection:

* `POST /arango-acid/api/COLLECTION_NAME`
* `PUT /arango-acid/api/COLLECTION_NAME/_key`
* `DELETE /arango-acid/api/COLLECTION_NAME/_key`

✅ Foreign key validation (FK) on insert and update

✅ Cascade delete support via `onDelete: "cascade"`

✅ Schema validation via embedded Joi rules

✅ Safe transactions with full rollback on failure

✅ Zero external dependencies — 100% Foxx-native

---

## ⚙️ Installation

### Using the ArangoDB Web UI:

1. Go to **Services (Foxx)**
2. Click **Upload**
3. Upload the folder or `.zip` file containing `arango-acid`
4. The endpoint will be available at `/arango-acid`

### Using the Foxx CLI:

```bash
foxx install ./arango-acid /arango-acid
```

---

## 📁 Project Structure

```
arango-acid/
├── lib/
│   ├── executor.js        # Handles transactional operations with rollback
│   ├── fkCheck.js         # Simulates foreign key validation
│   └── validator.js       # Validates schema using Joi
│
├── routes/
│   └── api.js             # Dynamic REST endpoints per collection
│
├── schemas/               # Optional Joi schema definitions
│
├── main.js                # Foxx service entry point
└── manifest.json          # Foxx service metadata
```

---

## 🔗 RESTful Endpoints

Once installed, transactional endpoints become available automatically:

```bash
# Insert into "users" collection
curl -u root:PASSWORD \
  -X POST https://host/_db/_system/arango-acid/api/users \
  -H "Content-Type: application/json" \
  -d '{"_key": "123", "name": "Tesla"}'

# Update document
curl -u root:PASSWORD \
  -X PUT https://host/_db/_system/arango-acid/api/users/123 \
  -H "Content-Type: application/json" \
  -d '{"name": "Nikola Tesla"}'

# Delete with cascade (if configured)
curl -u root:PASSWORD \
  -X DELETE https://host/_db/_system/arango-acid/api/users/123
```

All operations use ACID-like transactions with automatic rollback.

---

## 🧠 Foreign Key Integrity Rules (FKs)

Foreign keys are defined in the special `relations_config` collection:

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

This defines:

* The `posts` collection has a field `author`
* It references the `_key` field in the `users` collection
* When a user is deleted, all their posts are automatically removed

You can configure this manually in ArangoDB or via the upcoming `/config/relations` API.

---

## 📃 Full Payload Example (via `/acid` or internal use)

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

## 🔒 What Gets Validated?

| Validation Type            | Description                                                  |
| -------------------------- | ------------------------------------------------------------ |
| Joi Schema Validation      | Validates data structure, types, required fields, etc.       |
| Foreign Key (FK) Integrity | Validates referenced documents exist before insert/update    |
| Cascade Delete             | Automatically deletes child documents if `onDelete: cascade` |
| ACID-like Transactions     | Rolls back all operations if any one of them fails           |

---

## 🧠 Why Use ArangoACID?

* ArangoDB lacks native relational integrity
* Schema validation requires custom code
* REST operations don’t support rollback out of the box

ArangoACID solves all of this in a **centralized, reusable, and robust** way.

---

## 🧪 Project Roadmap

* 🔐 **OAuth2/JWT Authentication Support**
  Token-based access control via headers or cookies, with permission logic by collection and operation.
* 🔁 **Custom AQL Rule Integration**
  Define validation rules using AQL expressions for advanced business logic and commit prevention.
* 🧱 **Transactional Logging and Event Replay**
  Optionally store every transaction in `_acid_logs` for audit, recovery, and re-execution.
* ⚙️ **Visual Config Editor for Relations**
  UI dashboard (React or Vue) to manage `relations_config` graphically inside Foxx.
* 🧪 **Unit and Integration Tests with Mocha/Chai**
  Full test coverage for schema, transaction execution, foreign key logic, rollback and REST endpoints.
* 📦 **CI/CD Compatibility**
  Auto-export of endpoints and config for Docker/Kubernetes deployment and DevOps pipelines.
* 🌐 **Experimental GraphQL Layer**
  Optional GraphQL endpoint exposing validated and transactional operations via resolvers.

---

## 📖 License

Apache 2.0 — free to use, contributions welcome.

---

> Created with ❤️ by @Honinbou02
