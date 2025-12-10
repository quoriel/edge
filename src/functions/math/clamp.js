const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$clamp",
    description: "Clamps the value to the specified range",
    version: "1.0.0",
    output: ArgType.Number,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "value",
            description: "Value to clamp",
            type: ArgType.Number,
            required: true,
            rest: false
        },
        {
            name: "min",
            description: "Minimum value",
            type: ArgType.Number,
            required: true,
            rest: false
        },
        {
            name: "max",
            description: "Maximum value",
            type: ArgType.Number,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [value, min, max]) {
        return this.success(Math.max(min, Math.min(max, value)));
    }
});