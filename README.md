# QuorielEdge
A super-set of ForgeScript, designed to optimize workflows, apply community patches, simplify the execution of various tasks, and support script integration and processing.



## Installation
```bash
# Install using your package managers

# Using NPM
npm install github:quoriel/edge

# or using 3rd package managers
yarn install github:quoriel/edge
pnpm install github:quoriel/edge
bun  install github:quoriel/edge
```

## Connection
```js
const { ForgeClient } = require("@tryforge/forgescript");
const { QuorielEdge } = require("@quoriel/edge");

const client = new ForgeClient({
    extensions: [
        new QuorielEdge()
    ]
});

client.login("...");
```

## Building from source
You can clone this repository to your project workspace
> The code were build with bun's transpiler (ESM) and TypeScript (CJS)

```bash
# Run the following commands
# Using Bun
bun run build

# or using NodeJS v23
# Make sure to install bun if you're using nodejs
# npm install --save-dev bun

node --experimental-strip-types scripts/build.ts

```