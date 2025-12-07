const { Interpreter } = require("@tryforge/forgescript");
const { EventHandler } = require("../managers/eventHandler");
const { QuorielEdge } = require("../main");

exports.default = new EventHandler({
    name: "interactionCreate",
    description: "Handles non-slash command interactions",
    version: "1.0.0",
    listener(interaction) {
        if (interaction.isCommand()) return;
        const commands = this.getExtension(QuorielEdge, true).commands.get("interactionCreate");
        for (const command of commands) {
            const allowed = command.data.allowed;
            if (!allowed?.length || capricious(interaction, allowed)) {
                const id = interaction.customId;
                const index = id.indexOf(command.separator || "-");
                if ((index !== -1 ? id.substring(0, index) : id) === command.name) {
                    Interpreter.run({ obj: interaction, client: this, command, data: command.compiled.code, args: [] });
                }
            }
        }
    }
});

function capricious(interaction, types) {
    for (let i = 0, l = types.length; i < l; i++) {
        switch (types[i]) {
            case "button":
                if (interaction.isButton()) return true;
                break;
            case "selectMenu":
                if (interaction.isAnySelectMenu()) return true;
                break;
            case "modal":
                if (interaction.isModalSubmit()) return true;
                break;
            case "autocomplete":
                if (interaction.isAutocomplete()) return true;
                break;
            case "contextMenu":
                if (interaction.isContextMenuCommand()) return true;
                break;
            case "activityCommand":
                if (interaction.isPrimaryEntryPointCommand?.()) return true;
                break;
        }
    }
    return false;
}
