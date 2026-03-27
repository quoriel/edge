const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { functions } = require("../../edge");
const { readFileSync } = require("fs");
const { dirname } = require("path");
const Module = require("module");

function extract(path) {
    if (functions.has(path)) return functions.get(path);
    const code = `
        const __lcf = {};
        ${readFileSync(path, "utf8").replace(
            /^(async\s+)?function\s+(\w+)\s*\(/gm,
            (_, a, name) => `const ${name} = __lcf["${name}"] = ${a || ""}function ${name}(`
        )}
        module.exports.__functions = __lcf;
    `;
    const m = new Module(path);
    m.filename = path;
    m.paths = Module._nodeModulePaths(dirname(path));
    m._compile(code, path);
    functions.set(path, m.exports.__functions);
    return m.exports.__functions;
}

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
            type: ArgType.String,
            required: false,
            rest: true
        }
    ],
    async execute(ctx, [name, args]) {
        return this.success(await extract(ctx.cmd.data.path)[name](...args));
    }
});