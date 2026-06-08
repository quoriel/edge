const { Context } = require("@tryforge/forgescript");
const original = Context.prototype.getEnvironmentKey;

Context.prototype.getEnvironmentKey = function (...args) {
    if (args.length === 1 && args[0]?.startsWith("[")) {
        try {
            const parsed = JSON.parse(args[0]);
            if (Array.isArray(parsed)) return parsed;
        } catch {}
    }
    return original.apply(this, args);
};
