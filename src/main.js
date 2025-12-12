const { ForgeExtension, EventManager } = require("@tryforge/forgescript");
const { description, version } = require("../package.json");
const { CommandManager } = require("./managers/commandManager");
const { createEmitter } = require("@eolthar/events");

class QuorielEdge extends ForgeExtension {
    name = "QuorielEdge";
    description = description;
    version = version;
    emitter = createEmitter();
    commands;

    constructor(options) {
        super();
        this.options = options;
    }

    init(client) {
        this.commands = new CommandManager(client);
        this.load(__dirname + "/functions");
        EventManager.load("QuorielEdgeEvents", __dirname + "/events");
        if (this.options?.events?.includes("interactionCreate")) {
            client.events.load("QuorielEdgeEvents", this.options.events);
            client.on("interactionCreate", async interaction => {
                this.emitter.emit("interactionCreate", interaction);
            });
        }
    }
}

module.exports = { QuorielEdge };