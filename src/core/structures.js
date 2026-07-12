const { readdir } = require("fs/promises");
const { join, extname, basename } = require("path");
const { clearCache, scanDirectory } = require("./utils");

const structures = new Map();
let path = null;

function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

async function updateStructures() {
    if (!path) return;
    const paths = await scanDirectory(path, ".json");
    structures.clear();
    for (const file of paths) {
        structures.set(basename(file, extname(file)), require(file));
        clearCache(file);
    }
}

async function loadStructures(dir) {
    path = join(process.cwd(), dir);
    await updateStructures();
}

module.exports = { structures, isPlainObject, loadStructures, updateStructures };