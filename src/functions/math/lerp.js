const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$lerp",
    description: "Linear interpolation between two values",
    version: "1.0.0",
    output: ArgType.Number,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "start",
            description: "Start value",
            type: ArgType.Number,
            required: true,
            rest: false
        },
        {
            name: "end",
            description: "End value",
            type: ArgType.Number,
            required: true,
            rest: false
        },
        {
            name: "amount",
            description: "Interpolation factor (0-1)",
            type: ArgType.Number,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [start, end, amount]) {
        return this.success(start + (end - start) * amount);
    }
});