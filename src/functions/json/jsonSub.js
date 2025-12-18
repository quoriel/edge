const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$jsonSub",
    description: "Subtracts a number from a JSON key",
    version: "1.0.0",
    output: ArgType.Boolean,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "keys;value",
            description: "Keys to traverse, last element is the target value",
            type: ArgType.String,
            required: true,
            rest: true
        }
    ],
    execute(ctx, [keys]) {
        const val = +keys.pop();
        const num = ctx.getEnvironmentKey(...keys);
        const nex = (+num || 0) - val;
        return this.success(ctx.traverseAddEnvironmentKey(typeof num === "string" ? nex + "" : nex, ...keys));
    }
});