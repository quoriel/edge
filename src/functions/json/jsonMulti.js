const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { jsonMath } = require("../../edge");

exports.default = new NativeFunction({
    name: "$jsonMulti",
    description: "Multiplies a JSON key by a number",
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
        return this.success(jsonMath(ctx, keys, (a, b) => a * b));
    }
});