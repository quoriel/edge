const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { performance } = require("perf_hooks");

exports.default = new NativeFunction({
    name: "$benchmark",
    description: "Runs a code block N times and returns elapsed time and ops/sec",
    version: "1.0.0",
    output: ArgType.Json,
    unwrap: false,
    brackets: true,
    args: [
        {
            name: "code",
            description: "Code block to benchmark",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "iterations",
            description: "How many times to run the code, defaults to 1",
            type: ArgType.Number,
            rest: false
        },
        {
            name: "variable",
            description: "Environment variable to load the result into",
            type: ArgType.String,
            rest: false
        }
    ],
    async execute(ctx) {
        const resolved = await this.resolveMultipleArgs(ctx, 1, 2);
        if (!this.isValidReturnType(resolved.return)) return resolved.return;
        const want = Math.max(1, Math.floor(resolved.args[0] || 1));
        const variable = resolved.args[1];
        const code = this.data.fields[0];
        let ran = 0;
        const start = performance.now();
        for (; ran < want; ran++) {
            const exec = await this.resolveCode(ctx, code);
            if (exec.success || exec.continue || exec.return) continue;
            if (exec.break) break;
            return exec;
        }
        const time = performance.now() - start;
        const ops = ran / (time / 1000);
        const data = { time, ops, iterations: ran };
        if (variable) {
            ctx.setEnvironmentKey(variable, data);
            return this.success();
        }
        return this.successJSON(data);
    }
});