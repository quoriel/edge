const { readdir } = require("fs/promises");
const { join } = require("path");

async function scanDirectory(path, format) {
    const results = [];
    const files = await readdir(path, { withFileTypes: true });
    for (const file of files) {
        const full = join(path, file.name);
        if (file.isDirectory()) results.push(...(await scanDirectory(full, format)));
        else if (file.name.endsWith(format)) results.push(full);
    }
    return results;
}

function clearCache(path, visited = new Set()) {
    if (visited.has(path)) return;
    visited.add(path);
    const mod = require.cache[path];
    if (!mod) return;
    for (let i = 0, l = mod.children.length; i < l; i++) {
        clearCache(mod.children[i].id, visited);
    }
    delete require.cache[path];
}

module.exports = { scanDirectory, clearCache };