const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { caches } = require("../../edge");

exports.default = new NativeFunction({
    name: "$rangeCache",
    description: "Retrieves all entries from the cache",
    version: "1.0.0",
    output: ArgType.Json,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "table",
            description: "The table name",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [table]) {
        const result = [];
        for (const item of caches.get(table)) result.push({ key: item[0], value: item[1] });
        return this.successJSON(result);
    }
});