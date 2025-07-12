# Configuring Relations

ArangoACID reads foreign key rules from the `relations_config` collection. Each
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

You can manage these documents manually or via the `/config/relations` API.

## API usage
- `GET /config/relations` — list all configurations
- `POST /config/relations` — create a configuration document
- `PUT /config/relations/{key}` — replace configuration for a collection
- `DELETE /config/relations/{key}` — remove a configuration

Collections without a configuration document do not have their foreign keys
validated. All write operations run in transactions; violations cause a rollback.
