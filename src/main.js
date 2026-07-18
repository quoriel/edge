const { ForgeExtension } = require("@tryforge/forgescript");
const { Command } = require("./structures/command");
const { description, version } = require("../package.json");
const { initEvents, loadEvents } = require("./core/events");
const { updateStructures, resolveDefault } = require("./core/structures");
const { initUtils } = require("./core/utils");

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
        this.structures = {
            load: (path) => updateStructures(path)
        };
    }

    init(client) {
        this.load(__dirname + "/functions");
        if (this.options?.features) {
            for (const name of this.options.features) require("./patches/" + name);
        }
        initUtils(this.options);
        if (this.options?.events) {
            initEvents(client, this.options);
        }
    }
}

module.exports = { QuorielEdge, Command, resolveDefault };