const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { cache } = require("../../edge");

exports.default = new NativeFunction({
    name: "$setCache",
    description: "Sets a cache variable to the specified value",
    version: "1.0.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "name",
            description: "Variable name",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "value",
            description: "New value",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [name, value]) {
        cache.set(name, value);
        return this.success();
    }
});