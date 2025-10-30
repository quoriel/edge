// This file serves as a test for
// CommonJS modules

const { ForgeClient } = require("@tryforge/forgescript")
const { QuorielEdge } = require("@quoriel/edge")

const path = require("node:path")

const client = new ForgeClient({
    intents: ["Guilds"],
    events: [
        "clientReady"
    ],
    extensions: [
        new QuorielEdge()
    ]
})

client.commands.load(path.resolve(__dirname, 'commands'))
client.login(process.env.TOKEN)