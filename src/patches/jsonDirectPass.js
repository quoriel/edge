const { Context } = require("@tryforge/forgescript");
const original = Context.prototype.getEnvironmentKey;

Context.prototype.getEnvironmentKey = function (...args) {
    const arg = args[0];
    if (args.length === 1 && (arg.startsWith("[") || arg.startsWith("{"))) {
        try {
            return JSON.parse(arg);
        } catch {
            // it just works ¯\_(ツ)_/¯
        }
    }
    return original.call(this, ...args);
};