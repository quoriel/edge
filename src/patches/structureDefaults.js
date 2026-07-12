const { Context } = require("@tryforge/forgescript");
const { structures, isPlainObject } = require("../core/structures");

const originalGet = Context.prototype.getEnvironmentKey;
const originalAdd = Context.prototype.traverseAddEnvironmentKey;

Context.prototype.traverseAddEnvironmentKey = function (value, ...keys) {
    if (keys.length <= 1) return originalAdd.apply(this, [value, ...keys]);
    const root = keys[0];
    let structure = structures.get(root);
    let data = originalGet.call(this, root);
    if (data === null || typeof data !== "object") {
        if (!isPlainObject(structure) && !Array.isArray(structure)) return false;
        data = Array.isArray(structure) ? [] : {};
        this.setEnvironmentKey(root, data);
    }
    for (let i = 1, len = keys.length - 1; i < len; i++) {
        const key = keys[i];
        const current = data[key];
        const next = isPlainObject(structure) ? structure[key] : Array.isArray(structure) ? structure[0] : undefined;
        if (current !== null && typeof current === "object") {
            data = current;
            structure = next;
            continue;
        }
        if (!isPlainObject(next) && !Array.isArray(next)) return false;
        data[key] = Array.isArray(next) ? [] : {};
        structure = next;
        data = data[key];
    }
    data[keys[keys.length - 1]] = value;
    return true;
};