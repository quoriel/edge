const { NativeFunction } = require("@tryforge/forgescript");
const { updateStructures } = require("../../core/structures");

exports.default = new NativeFunction({
    name: "$updateStructures",
    description: "Reloads all default value schemas from the previously loaded folder",
    version: "1.0.0",
    unwrap: false,
    async execute(ctx) {
        await updateStructures();
        return this.success();
    }
});