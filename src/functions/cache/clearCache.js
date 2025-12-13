const { NativeFunction } = require("@tryforge/forgescript");
const { cache } = require("../../edge");

exports.default = new NativeFunction({
    name: "$clearCache",
    description: "Clears all cached data from memory",
    version: "1.0.0",
    unwrap: false,
    execute(ctx) {
        cache.clear();
        return this.success();
    }
});