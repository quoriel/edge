const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { caches } = require("../../core/utils");

exports.default = new NativeFunction({
    name: "$setCache",
    description: "Sets a cache variable to the specified value",
    version: "1.0.0",
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
        },
        {
            name: "value",
            description: "New value",
            type: ArgType.Json,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [table, name, value]) {
        caches.get(table).set(name, value);
        return this.success();
    }
});