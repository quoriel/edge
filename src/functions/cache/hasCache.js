const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { caches } = require("../../edge");

exports.default = new NativeFunction({
    name: "$hasCache",
    description: "Checks if a cache key exists",
    version: "1.0.0",
    output: ArgType.Boolean,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "table",
            description: "The table name",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "name",
            description: "Variable name",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [table, name]) {
        return this.success(caches.get(table).has(name));
    }
});