const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { performance } = require("perf_hooks");

const key = Symbol.for("quoriel.benchmark");

exports.default = new NativeFunction({
    name: "$endBenchmark",
    description: "Ends measuring and returns execution time in milliseconds",
    version: "1.0.0",
    output: ArgType.Number,
    unwrap: false,
    execute(ctx) {
        const value = performance.now() - ctx[key];
        delete ctx[key];
        return this.success(value);
    }
});