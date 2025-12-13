const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { cache } = require("../../edge");

exports.default = new NativeFunction({
    name: "$keysCache",
    description: "Returns all keys from the cache",
    version: "1.0.0",
    output: ArgType.Json,
    unwrap: false,
    execute(ctx) {
        return this.successJSON([...cache.keys()]);
    }
});