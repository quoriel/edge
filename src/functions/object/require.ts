import { NativeFunction, ArgType } from "@tryforge/forgescript";
import { resolve } from 'path'
import { existsSync } from "fs";

export default new NativeFunction({
    name: "$require",
    description: "Loads the module to $require",
    output: ArgType.Unknown,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "path",
            description: "Module path",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [path]) {
        const full = resolve(process.cwd(), path);
        if (!existsSync(full)) return this.stop();
        try {
            const result = require(full);
            return this.success(typeof result === "object" ? JSON.stringify(result) : result);
        } catch {
            return this.success();
        }
    }
});