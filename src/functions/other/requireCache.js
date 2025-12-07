const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { resolve } = require("path");

const ActionType = {
    delete: "delete",
    update: "update"
}

exports.default = new NativeFunction({
    name: "$requireCache",
    description: "Deletes a module from the cache or reloads it (including dependencies)",
    version: "1.0.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "path",
            description: "Module path",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "type",
            description: "Type of action",
            type: ArgType.Enum,
            enum: ActionType,
            required: true,
            rest: false
        },
        {
            name: "recursive",
            description: "Whether to clear cache recursively",
            type: ArgType.Boolean,
            rest: false
        }
    ],
    async execute(ctx, [path, type, recursive]) {
        const full = resolve(process.cwd(), path);
        if (recursive) {
            clear(full);
        } else {
            delete require.cache[full];
        }
        if (type === "update") {
            require(full);
        }
        return this.success();
    }
});

function clear(path) {
    const mod = require.cache[path];
    if (!mod) return;
    for (let i = 0, l = mod.children.length; i < l; i++) {
        clear(mod.children[i].id);
    }
    delete require.cache[path];
}