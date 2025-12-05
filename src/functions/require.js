const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { resolve } = require("path");

exports.default = new NativeFunction({
    name: "$require",
    description: "Dynamically loads the module",
    version: "1.0.0",
    output: ArgType.Unknown,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "path",
            description: "Module path",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [path]) {
        return this.successJSON(require(resolve(process.cwd(), path)));
    }
});