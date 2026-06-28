# Events and Commands Documentation
Before creating command files, make sure you have properly initialized and connected the `QuorielEdge` class in your project's main file.

```js
const { ForgeClient } = require("@tryforge/forgescript");
const { QuorielEdge } = require("@quoriel/edge");

const edge = new QuorielEdge({
    events: ["messageCreate", "interactionCreate"],
    prefixes: ["."], // Required parameter for text commands to work
    separator: "-" // Optional default separator for interactions "-"
});

const client = new ForgeClient({
    extensions: [edge] // Connecting the class as an extension
});

// Loading the commands and interactions folders
edge.commands.load("commands");
edge.commands.load("interactions");

client.login("...");
```

## Text Commands (`messageCreate`)
```js
module.exports = {
    name: "ping",
    aliases: ["latency", "check"],
    type: "messageCreate",
    rules: {
        prefixed: true,
        guilds: true,
        users: true
    },
    only: {
        guilds: ["123456789"],
        users: ["987654321", "$valueRecord[user;admin]"]
    },
    code: `Pong! $ping ms.`
};
```

> [!IMPORTANT]
> For text commands to work, the `prefixes` array must be passed in the class configuration. Without it, commands will not be processed.

### Module Structure
- **name** - Command identifier.
- **type** - Event type, strictly `"messageCreate"`.
- **code** - Executable command code.
- **rules** - Message filter object (optional).
- **only** - Whitelist object by ID (optional).
- **aliases** - Alternative command names (optional).

### rules
If not specified, the default is applied: `{ prefixed: true, guilds: true, users: true }`. Each key adds a check only if it is specified - an absent key means the check is not applied.

| Key        | `true`              | `false`              |
| ---------- | ------------------- | -------------------- |
| `prefixed` | prefix only         | no prefix only       |
| `users`    | humans only         | bots only            |
| `guilds`   | servers only        | DM only              |
| `channels` | regular channels    | -                    |
| `threads`  | threads             | -                    |
| `nsfw`     | nsfw channels       | -                    |

> [!NOTE]
> The `channels`, `threads`, and `nsfw` keys act as OR between each other - if at least one is specified, the remaining unset ones are blocked. If none are specified, the channel type is not checked.

> [!NOTE]
> If `guilds` is not specified but channel keys are - DMs automatically bypass the channel check.

### only
A strict whitelist by ID - the message must match **all** specified types. Supports static IDs and ForgeScript expressions (`$`).

```js
only: {
    users: ["123456789", "$authorID"],
    channels: ["987654321"],
    guilds: ["111222333"],
    categories: ["444555666"]
}
```

- **users** - Message author ID.
- **channels** - Channel ID.
- **guilds** - Server ID.
- **categories** - Channel category ID.

## Interactions (`interactionCreate`)
```js
module.exports = {
    name: "role",
    type: "interactionCreate",
    allowed: ["button"],
    code: `$ephemeral You clicked the role management button, $username!`
};
```

### Module Structure
- **name** - Interaction identifier.
- **type** - Event type, strictly `"interactionCreate"`.
- **code** - Executable code.
- **allowed** - Array of allowed interaction types (optional).
- **aliases** - Array of alternative identifiers (optional).

### Supported Types
`activityCommand`, `autocomplete`, `userContextMenu`, `messageContextMenu`, `contextMenu`, `button`, `modal`, `stringSelect`, `userSelect`, `roleSelect`, `mentionableSelect`, `channelSelect`, `selectMenu`, `messageComponent`, `repliable`.

### Custom ID Splitting
Interactions are routed by `customId` (or `commandName` for context menus) - when a separator is present (`-` by default), the part of the string before the first occurrence is used.

> [!NOTE]
> If the bot generated a button with ID `role-12345`, the code will automatically extract the `role` part and find the corresponding interaction module to execute. This makes it easy to pass dynamic parameters through component IDs.