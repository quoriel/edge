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
    const source = readFileSync(path, "utf8");
    const ast = acorn.parse(source, { ecmaVersion: 2020, sourceType: "script" });
    const names = new Set();
    const cuts = [];
    for (const node of ast.body) {
        if (node.type === "FunctionDeclaration" && node.id?.name) {
            names.add(node.id.name);
        }
        if (node.type === "VariableDeclaration") {
            for (const decl of node.declarations) {
                if (decl.id.type === "Identifier") {
                    names.add(decl.id.name);
                } else if (decl.id.type === "ObjectPattern") {
                    structure(decl.id).forEach((n) => names.add(n));
                }
            }
        }
        if (
            node.type === "ExpressionStatement" &&
            node.expression.type === "AssignmentExpression" &&
            node.expression.left.type === "MemberExpression" &&
            (
                (node.expression.left.object.name === "module" && node.expression.left.property.name === "exports") ||
                (node.expression.left.object.name === "exports" && node.expression.left.property.name === "default")
            )
        ) {
            cuts.push([node.start, node.end]);
        }
    }
    let stripped = source;
    for (let i = cuts.length - 1; i >= 0; i--) {
        stripped = stripped.slice(0, cuts[i][0]) + stripped.slice(cuts[i][1]);
    }
    const code = `
        const __lcf = {};
        ${stripped}
        ${[...names].map((n) => `if (typeof ${n} === "function") __lcf["${n}"] = ${n};`).join("\n")}
        module.exports.functions = __lcf;
    `;
    const m = new Module(path);
    m.filename = path;
    m.paths = Module._nodeModulePaths(dirname(path));
    m._compile(code, path);
    return m.exports.functions;
}

module.exports = { extract };