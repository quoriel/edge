const { NativeFunction, ArgType, Context } = require("@tryforge/forgescript");
const { structures, isPlainObject } = require("../../core/structures");

function mergeWithDefault(value, def) {
    if (isPlainObject(value) && isPlainObject(def)) {
        const result = { ...value };
        for (const key in def) {
            result[key] = key in value ? mergeWithDefault(value[key], def[key]) : cloneDefault(def[key]);
        }
        return result;
    }
    if (Array.isArray(value) && Array.isArray(def)) {
        const result = value.slice();
        for (let i = 0, len = def.length; i < len; i++) {
            result[i] = i in value ? mergeWithDefault(value[i], def[i]) : cloneDefault(def[i]);
        }
        return result;
    }
    return value !== undefined ? value : cloneDefault(def);
}

function cloneDefault(value) {
    return value !== null && typeof value === "object" ? structuredClone(value) : value;
}

exports.default = new NativeFunction({
    name: "$qev",
    description: "Retrieves an environment value with fallback to structure defaults",
    version: "1.0.0",
    output: ArgType.Unknown,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "key",
            description: "The keys to traverse",
            type: ArgType.String,
            required: true,
            rest: true
        }
    ],
    execute(ctx, [args]) {
        const value = ctx.getEnvironmentKey(...args);
        if (value !== undefined && !isPlainObject(value) && !Array.isArray(value)) return this.successJSON(value);
        const def = Context.traverseGetValue(structures.get(args[0]), ...args.slice(1));
        if (isPlainObject(value) && isPlainObject(def)) return this.successJSON(mergeWithDefault(value, def));
        if (Array.isArray(value) && Array.isArray(def)) return this.successJSON(mergeWithDefault(value, def));
        return this.successJSON(value !== undefined ? value : cloneDefault(def));
    }
});