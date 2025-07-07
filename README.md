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
