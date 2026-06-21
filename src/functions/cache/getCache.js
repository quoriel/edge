const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { caches } = require("../../core/utils");

exports.default = new NativeFunction({
    name: "$getCache",
    description: "Retrieves and loads data from the cache by variable",
    version: "1.0.0",
    output: ArgType.Unknown,
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
            name: "variable",
            description: "Environment variable name",
            type: ArgType.String,
            rest: false
        }
    ],
    execute(ctx, [table, name, variable]) {
        const value = caches.get(table).get(name);
        if (variable) {
            ctx.setEnvironmentKey(variable, value);
            return this.success();
        }
        return this.successJSON(value);
    }
});