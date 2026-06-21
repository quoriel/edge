const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { caches } = require("../../core/utils");

exports.default = new NativeFunction({
    name: "$clearCache",
    description: "Clears cached data, clearing all tables if no table is provided",
    version: "1.0.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "table",
            description: "The table name",
            type: ArgType.String,
            rest: false
        }
    ],
    execute(ctx, [table]) {
        if (table) {
            caches.get(table).clear();
        } else {
            for (const item of caches) item[1].clear();
        }
        return this.success();
    }
});