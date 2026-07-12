# Default Values System Documentation
Before using `$qev` or relying on schema-typed `$jsonSet`, make sure the `QuorielEdge` class is properly connected and the structures folder is loaded.

```js
const { ForgeClient } = require("@tryforge/forgescript");
const { QuorielEdge } = require("@quoriel/edge");

const edge = new QuorielEdge({
    features: ["structureDefaults"] // Required for schema-typed $jsonSet
});

const client = new ForgeClient({
    extensions: [edge] // Connecting the class as an extension
});

// Loading the structures folder
edge.structures.load("structures");

client.login("...");
```

## Schemas
Each schema is a JSON file that describes the shape and default values for a single root environment key (e.g. `user`, `economy`). The file name (without the extension) becomes the root key the schema applies to.

```
structures/
├── user.json
└── economy.json
```

```js
// structures/user.json
{
    "memory": "0",
    "snake": "0",
    "cash": "0",
    "color": "#FFFFFF",
    "prefix": "."
}
```

> [!IMPORTANT]
> Real data always takes priority over the schema. The schema only acts as a fallback for values that don't exist yet in the environment - it never overwrites or hides real data.

## Reading - `$qev`
```
$qev[key;...path]
```

| Parameter | Type   | Required | Description                        |
| --------- | ------ | -------- | ------------------------------------ |
| `key`     | String | Yes      | Root environment key                |
| `path`    | String | No       | Additional path keys (rest)         |

Returns the value at the given path, merged with the schema if part of the data is missing. `$env` is not affected by this system and always returns raw data without defaults - this is intentional, many native functions (`$arrayPush`, `$jsonHas`, `$arrayPop`, etc.) rely on `$env` returning the real, unmodified state.

```
$qev[user] // { memory: "0", snake: "0", cash: "0", color: "#FFFFFF", prefix: "." }
$qev[user;cash] // "0"
```

If the real data already contains a value for a field, that value is returned as-is - the schema isn't even looked at for that field.

**Objects** are merged recursively, field by field, rather than being replaced wholesale:

```js
// structures/economy.json
{ "inventory": { "capacity": 20, "custom": 0 } }
```
```
$jsonSet[economy;inventory;custom;1]
$qev[economy] // { inventory: { custom: 1, capacity: 20 } }
```
Only fields missing from the real data are merged in (`capacity`) - existing fields (`custom`) are left untouched.

**Arrays** are merged the same way as objects, just with numeric indices instead of string keys: each element in the real data is merged with the schema element at the same index.
- If there's nothing at the matching index in the schema (the schema has fewer elements than the real array) - there's no default for that element, it's left as-is.
- If an element doesn't exist at that index in the real data but does in the schema - a clone of the schema's value is used.
- To set a default for a distant index (e.g. `[5]`), fill the earlier positions in the schema with `null`s - otherwise they'd become defaults for the earlier elements themselves.

```js
// structures/economy.json
{ "items": [{ "qty": 1, "rarity": "common" }, { "qty": 99, "rarity": "epic" }] }
```
```
$env[economy;items] // [{ "name": "sword", "qty": 5 }, { "name": "shield" }]
$qev[economy;items]
// [
//   { "name": "sword", "qty": 5, "rarity": "common" },
//   { "name": "shield", "qty": 99, "rarity": "epic" }
// ]
```

## Writing - `$jsonSet`
Besides reading, the schema also affects how `$jsonSet` creates intermediate containers when writing to a path that doesn't exist yet in the real data.

For each key in the path (except the last one):
- If the real data already has an object or array at that key - it's used as-is, the schema isn't consulted.
- If the real data is empty at that key - the container type (object or array) is determined from the schema. If a new array element is being created that doesn't have its own entry in the schema yet, the container's shape is taken from the first element of the schema array - this is only about the "object or array" fact itself, not about merging values (that's separate, see `$qev` above).
- If neither the real data nor the schema has a type for that key - the write fails, `$jsonSet` returns `false`.

The last key in the path is always written as-is - its type is never checked against the schema.

```
$jsonSet[economy;inventory;items;sword] // "inventory" is created as an object (per the schema), "items" gets the value "sword" directly
```

## Limitations
- `$env` never returns defaults - only `$qev` does.
- Key order in `$qev`'s output relative to the schema isn't guaranteed. Keys already present in the real data keep their original position; missing keys pulled from the schema are always appended at the end.