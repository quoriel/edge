# Features Documentation
Features are optional extensions that add new capabilities to ForgeScript. They are enabled via the `features` parameter when initializing `QuorielEdge`.

```js
const edge = new QuorielEdge({
    features: ["extractFunctions", "jsonDirectPass", "restArgSpread", "structureDefaults"]
});
```

> [!NOTE]
> Features are independent of each other - you can enable any of them in any order.

## `extractFunctions`
Allows you to declare regular JS functions directly in the command file and call them via `$call` - without the need to move logic into separate modules.

Without this feature, local JS functions defined in the file are not accessible from the command code.
```js
// commands/ping.js
function formatPing(ms) {
    return ms < 100 ? "🟢" : ms < 300 ? "🟡" : "🔴";
}

module.exports = {
    name: "ping",
    type: "messageCreate",
    code: `$call[formatPing;$ping]`
};
```

Functions are called via `$call[functionName;...args]`.

> [!NOTE]
> Functions are re-extracted on command reload - compatible with `$updateCommands` and `$updateEvents`.

## `jsonDirectPass`
Allows passing JSON arrays and JSON objects directly as an argument to functions that accept an environment variable - it works by looking up the object or array if the environment variable turns out to be one.

Without this feature, you need to save the data to a variable first:
```
$arrayLoad[nums; ;1 2 3]
$arrayRandomValue[nums]

$jsonLoad[data;{"cash": 53456}]
$env[data;cash]
```

With this feature, you can pass JSON directly as an argument:
```
$arrayRandomValue[["1", "2", "3"\]] // 2
$env[{"cash": 53456};cash] // 53456
```

## `restArgSpread`
Works for all functions that accept a rest argument - spreads data from a string as separate arguments into the function it is placed in.

### `$spread`
```
$spread[value;separator?]
```

| Parameter   | Type   | Required | Description                          |
| ----------- | ------ | -------- | ------------------------------------ |
| `value`     | String | Yes      | The string to spread                 |
| `separator` | String | No       | Separator (default: `;`)             |

```
$sum[$spread[1, 2, 3;, ]] // 6
$hasPerms[$guildID;$botID;$spread[ViewChannel-AddReactions;-]] // true
```

> [!NOTE]
> `$spread` only works inside rest arguments.

## `structureDefaults`
Adds schema-based default values for environment data - lets `$qev` merge in defaults from JSON schemas and makes `$jsonSet` create intermediate containers by schema shape.

See [DEFAULTS.md](DEFAULTS.md) for the full documentation.