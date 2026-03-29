const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { functions } = require("../../edge");
const { readFileSync } = require("fs");
const { dirname } = require("path");

const Module = require("module");
const acorn = require("acorn");

function structure(pattern) {
    const names = [];
    for (const prop of pattern.properties) {
        if (prop.value.type === "Identifier") {
            names.push(prop.value.name);
        } else if (prop.value.type === "ObjectPattern") {
            names.push(...structure(prop.value));
        }
    }
    return names;
}

function extract(path) {
    if (functions.has(path)) return functions.get(path);
    const source = readFileSync(path, "utf8");
    const ast = acorn.parse(source, { ecmaVersion: 2020, sourceType: "script" });
    const names = new Set();
    for (const node of ast.body) {
        if (node.type === "FunctionDeclaration" && node.id?.name) {
            names.add(node.id.name);
        }
        if (node.type === "VariableDeclaration") {
            for (const decl of node.declarations) {
                if (decl.id.type === "Identifier") {
                    names.add(decl.id.name);
                } else if (decl.id.type === "ObjectPattern") {
                    structure(decl.id).forEach(n => names.add(n));
                }
            }
        }
    }
    const code = `
        const __lcf = {};
        ${source}
        ${[...names].map(n => `if (typeof ${n} === "function") __lcf["${n}"] = ${n};`).join("\n")}
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