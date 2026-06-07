const cache = new Map();
const functions = new Map();

function jsonMath(ctx, keys, op) {
    const val = +keys.pop();
    const num = ctx.getEnvironmentKey(...keys);
    const nex = op(+num || 0, val);
    return ctx.traverseAddEnvironmentKey(typeof num === "string" ? nex + "" : nex, ...keys);
}

module.exports = { cache, functions, jsonMath };