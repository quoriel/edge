# Cache Documentation
Cache allows storing data in memory within the bot's process, organized into named tables. Each table is a separate store with its own keys and values.

Tables are declared via the `caches` parameter when initializing `QuorielEdge`:
```js
const edge = new QuorielEdge({
    caches: ["users", "arena", "leaderboard"]
});
```

> [!IMPORTANT]
> All tables you intend to use must be declared in `caches` - without this, the cache functions will not work.

> [!NOTE]
> Data is stored in memory only and is cleared on bot restart.

## Available Functions
`$setCache` `$getCache` `$hasCache` `$deleteCache` `$clearCache` `$keysCache` `$rangeCache`

## Example
```
// Save user data
$setCache[users;$authorID;{"xp": 120, "level": 3}]

// Retrieve data
$getCache[users;$authorID]

// Check existence
$hasCache[users;$authorID]

// Delete an entry
$deleteCache[users;$authorID]

// Clear a table
$clearCache[users]
```