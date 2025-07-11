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
