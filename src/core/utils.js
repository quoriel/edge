const caches = new Map();

function initUtils(options) {
    if (options?.caches) {
        for (const name of options.caches) caches.set(name, new Map());
    }
}

function jsonMath(ctx, keys, op) {
    const val = +keys.pop();
    const num = ctx.getEnvironmentKey(...keys);
    const nex = op(+num || 0, val);
    return ctx.traverseAddEnvironmentKey(typeof num === "string" ? nex + "" : nex, ...keys);
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

module.exports = { caches, initUtils, jsonMath, clearCache };