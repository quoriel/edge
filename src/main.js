const { ForgeExtension } = require("@tryforge/forgescript");
const { description, version } = require("../package.json");
const { interactions, commands, init, loadEvents } = require("./edge");

class QuorielEdge extends ForgeExtension {
    name = "QuorielEdge";
    description = description;
    version = version;

    constructor(options) {
        super();
        this.options = options;
        this.commands = {
            load: (path) => loadEvents(path)
        };
    }

    init(client) {
        this.load(__dirname + "/functions");
        if (this.options?.features?.includes("jsonDirectPass")) require("./patches/jsonDirectPass");

        if (this.options?.events) {
            const sep = this.options.separator || "-";
            init(client);

            if (this.options.events.includes("interactionCreate")) {
                client.on("interactionCreate", (interaction) => {
                    if (interaction.isChatInputCommand()) return;
                    const raw = interaction.customId || interaction.commandName;
                    const sp = raw.indexOf(sep);
                    interactions.emit(sp !== -1 ? raw.substring(0, sp) : raw, interaction);
                });
            }

        }
    }
}

module.exports = { QuorielEdge };