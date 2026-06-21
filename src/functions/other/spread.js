const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$spread",
    description: "Spreads a delimited string as individual rest arguments",
    version: "1.0.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "value",
            description: "Delimited string to spread",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "separator",
            description: "Separator character",
            type: ArgType.String,
            rest: false
        }
    ],
    execute(ctx) {
        return this.success();
    }
});