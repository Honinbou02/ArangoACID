# Configuring Relations

ArangoACID reads foreign key rules from the `__relations_config__` collection. Each
configuration document uses the target collection name as `_key` and stores its
rules in the `relations` array.

Example document:

```json
{
  "_key": "users",
  "relations": [
    { "localField": "role", "refCollection": "roles", "refField": "_key" }
  ]
}
```

Rules can also include an `onDelete` property to control behaviour when a parent
document is removed. Use `onDelete: "cascade"` to automatically delete child
documents referencing the removed document.

Example with cascade delete:

```json
{
  "_key": "clientes",
  "relations": [
    { "refCollection": "pedidos", "refField": "clienteId", "onDelete": "cascade" }
  ]
}
```

You can manage these documents manually or via the `/config/relations` API.

## API usage
- `GET /config/relations` — list all configurations
- `POST /config/relations` — create a configuration document
- `PUT /config/relations/{key}` — replace configuration for a collection
- `DELETE /config/relations/{key}` — remove a configuration

Collections without a configuration document do not have their foreign keys
validated. All write operations run in transactions; violations cause a rollback.
