const { NativeFunction } = require("@tryforge/forgescript");
const { performance } = require("perf_hooks");

const key = Symbol.for("quoriel.benchmark");

exports.default = new NativeFunction({
    name: "$benchmarkStart",
    description: "Starts measuring code execution time",
    version: "1.0.0",
    unwrap: false,
    execute(ctx) {
        ctx[key] = performance.now();
        return this.success();
    }
});