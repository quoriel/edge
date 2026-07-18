const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { caches } = require("../../core/utils");
const { readFileSync } = require("fs");

exports.default = new NativeFunction({
    name: "$importCache",
    description: "Imports entries from a JSON file into a cache table",
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
            name: "file",
            description: "The file path",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [table, file]) {
        const data = JSON.parse(readFileSync(file, "utf8"));
        const cache = caches.get(table);
        for (const key in data) cache.set(key, data[key]);
        return this.success();
    }
});