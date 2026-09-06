const { readFileSync } = require("fs");
const { dirname } = require("path");

const Module = require("module");
const acorn = require("acorn");

function bindings(node, names) {
    switch (node.type) {
        case "Identifier":
            names.add(node.name);
            break;
        case "ObjectPattern":
            for (const prop of node.properties) {
                bindings(prop.type === "RestElement" ? prop.argument : prop.value, names);
            }
            break;
        case "ArrayPattern":
            for (const element of node.elements) {
                if (element) bindings(element, names);
            }
            break;
        case "RestElement":
            bindings(node.argument, names);
            break;
        case "AssignmentPattern":
            bindings(node.left, names);
            break;
    }
}

function extractFunctions(path) {
    let source = readFileSync(path, "utf8");
    if (source.charCodeAt(0) === 35 && source.charCodeAt(1) === 33) {
        source = "//" + source.slice(2);
    }
    const ast = acorn.parse(source, { ecmaVersion: "latest", sourceType: "commonjs" });
    const names = new Set();
    const cuts = [];
    for (const node of ast.body) {
        if ((node.type === "FunctionDeclaration" || node.type === "ClassDeclaration") && node.id?.name) {
            names.add(node.id.name);
        }
        if (node.type === "VariableDeclaration") {
            for (const decl of node.declarations) {
                bindings(decl.id, names);
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
    let collect = "";
    for (const name of names) {
        collect += `if (typeof ${name} === "function") __lcf["${name}"] = ${name};`;
    }
    const m = new Module(path);
    m.filename = path;
    m.paths = Module._nodeModulePaths(dirname(path));
    m._compile(`const __lcf = {};${stripped}\n${collect}module.exports.functions = __lcf;`, path);
    return m.exports.functions;
}

module.exports = { extractFunctions };