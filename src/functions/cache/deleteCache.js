const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { caches } = require("../../edge");

exports.default = new NativeFunction({
    name: "$deleteCache",
    description: "Deletes data from the cache by variable",
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
        }
    ],
    execute(ctx, [table, name]) {
        caches.get(table).delete(name);
        return this.success();
    }
});