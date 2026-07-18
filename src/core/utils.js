const { resolveDefault } = require("./structures");

const caches = new Map();

function initUtils(options) {
    if (options?.caches) {
        for (const name of options.caches) caches.set(name, new Map());
    }
}

function jsonMath(ctx, keys, op) {
    const val = +keys.pop();
    const num = resolveDefault(ctx.getEnvironmentKey(...keys), keys[0], ...keys.slice(1));
    const nex = op(+num || 0, val);
    return ctx.traverseAddEnvironmentKey(typeof num === "string" ? nex + "" : nex, ...keys);
}

module.exports = { caches, initUtils, jsonMath };