import { ForgeClient } from "@tryforge/forgescript";
import { QuorielEdge } from '@quoriel/edge'

import { resolve } from "path";

const client = new ForgeClient({ intents: ['Guilds'], extensions: [new QuorielEdge()], events: ['clientReady'] })

client.commands.load(resolve(__dirname, 'commands'))

client.login(process.env.TOKEN)