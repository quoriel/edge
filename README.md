# QuorielEdge
An extended set of functions for **ForgeScript**, designed to optimize workflows, simplify the execution of various tasks, and support script integration and processing.

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

## Useful
- Configure the class to use cache functions [View documentation](docs/CACHE.md)
- Events and commands with advanced routing and filtering [View documentation](docs/EVENTS.md)
- Optional features that extend ForgeScript behavior [View documentation](docs/PATCHES.md)
- Define JSON schemas to auto-fill missing environment data [View documentation](docs/DEFAULTS.md)