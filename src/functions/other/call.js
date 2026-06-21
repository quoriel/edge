const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$call",
    description: "Calls a local JS function defined in the command file",
    version: "1.0.0",
    output: ArgType.Unknown,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "name",
            description: "Function name",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "args",
            description: "Arguments to pass to the function",
            type: ArgType.Json,
            required: false,
            rest: true
        }
    ],
    async execute(ctx, [name, args]) {
        return this.successJSON(await ctx.cmd.data.functions[name](...args));
    }
});