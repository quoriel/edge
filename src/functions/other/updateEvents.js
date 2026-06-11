const { NativeFunction } = require("@tryforge/forgescript");
const { updateEvents } = require("../../edge");

exports.default = new NativeFunction({
    name: "$updateEvents",
    description: "Updates all events routes",
    version: "1.0.0",
    unwrap: false,
    async execute(ctx) {
        await updateEvents();
        return this.success();
    }
});