const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$gcd",
    description: "Calculates the greatest common divisor of two numbers",
    version: "1.0.0",
    output: ArgType.Number,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "first",
            description: "First number",
            type: ArgType.Number,
            required: true,
            rest: false
        },
        {
            name: "second",
            description: "Second number",
            type: ArgType.Number,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [first, second]) {
        let a = Math.abs(first);
        let b = Math.abs(second);
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return this.success(a);
    }
});