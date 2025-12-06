# QuorielEdge
An extended set of functions for ForgeScript, designed to optimize workflows, simplify the execution of various tasks, and support script integration and processing.

## Installation
```
npm i github:quoriel/edge
```

## Connection
```js
const { ForgeClient } = require("@tryforge/forgescript");
const { QuorielEdge } = require("@quoriel/edge");

const edge = new QuorielEdge({
    events: [
        "interactionCreate"
    ]
});

const client = new ForgeClient({
    extensions: [
        edge
    ]
});

// Loading interactions.
edge.commands.load("interactions");

client.login("...");
```

## Interaction
```js
module.exports = {
    name: "hello",
    type: "interactionCreate",
    code: `$sendMessage[$channelID;Hello world!]`
};
```

### Structure
- **name** - The interaction identifier (customId prefix before separator)
- **separator** - Custom separator for splitting customId (default: `-`) (optional)
- **allowed** - Array of allowed interaction types (optional)

### Supported allowed
`button`, `selectMenu`, `modal`, `autocomplete`, `contextMenu`, `activityCommand`
