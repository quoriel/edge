const { ForgeExtension } = require("@tryforge/forgescript");
const { description, version } = require("../package.json");
const { interactions, commands, init, getPrefix, loadEvents } = require("./edge");

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
            init(client, this.options);

            if (this.options.events.includes("interactionCreate")) {
                client.on("interactionCreate", (interaction) => {
                    if (interaction.isChatInputCommand()) return;
                    const raw = interaction.customId || interaction.commandName;
                    const sp = raw.indexOf(sep);
                    interactions.emit(sp !== -1 ? raw.substring(0, sp) : raw, interaction);
                });
            }

            if (this.options.events.includes("messageCreate")) {
                client.on("messageCreate", async (message) => {
                    const content = message.content.trim();
                    const sp = content.indexOf(" ");
                    const raw = (sp !== -1 ? content.substring(0, sp) : content).toLowerCase();
                    if (!raw) return;
                    const prefix = await getPrefix(message, raw);
                    const name = prefix ? raw.substring(prefix.length) : raw;
                    commands.emit(name, message, sp !== -1 ? content.substring(sp + 1) : "", prefix !== null);
                });
            }
        }
    }
}

module.exports = { QuorielEdge };