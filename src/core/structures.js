const { Context } = require("@tryforge/forgescript");
const { join, extname, basename } = require("path");
const { clearCache, scanDirectory } = require("./fs");

const structures = new Map();
let path = null;

function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cloneDefault(value) {
    return value !== null && typeof value === "object" ? structuredClone(value) : value;
}

function mergeWithDefault(value, def) {
    if (isPlainObject(value) && isPlainObject(def)) {
        const result = { ...value };
        for (const key in def) {
            result[key] = key in value ? mergeWithDefault(value[key], def[key]) : cloneDefault(def[key]);
        }
        return result;
    }
    if (Array.isArray(value) && Array.isArray(def)) {
        const result = value.slice();
        for (let i = 0, len = def.length; i < len; i++) {
            result[i] = i in value ? mergeWithDefault(value[i], def[i]) : cloneDefault(def[i]);
        }
        return result;
    }
    return value !== undefined ? value : cloneDefault(def);
}

function resolveDefault(value, root, ...path) {
    if (value !== undefined && !isPlainObject(value) && !Array.isArray(value)) return value;
    const def = Context.traverseGetValue(structures.get(root), ...path);
    if (isPlainObject(value) && isPlainObject(def)) return mergeWithDefault(value, def);
    if (Array.isArray(value) && Array.isArray(def)) return mergeWithDefault(value, def);
    return value !== undefined ? value : cloneDefault(def);
}

async function updateStructures(dir) {
    if (!path) {
        if (!dir) return;
        path = join(process.cwd(), dir);
    }
    const paths = await scanDirectory(path, ".json");
    structures.clear();
    for (const file of paths) {
        structures.set(basename(file, extname(file)), require(file));
        clearCache(file);
    }
}

module.exports = { structures, isPlainObject, resolveDefault, updateStructures };