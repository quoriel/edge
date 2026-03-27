const { NativeFunction } = require("@tryforge/forgescript");
const { functions } = require("../../edge");

exports.default = new NativeFunction({
    name: "$callClear",
    description: "Clears entire $call cache",
    version: "1.0.0",
    unwrap: false,
    execute(ctx) {
        functions.clear();
        return this.success();
    }
});