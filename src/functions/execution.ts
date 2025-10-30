import {
    Compiler,
    Interpreter,
    ArgType,
    NativeFunction,
    Logger
} from '@tryforge/forgescript'
import { resolve } from 'path'
import { existsSync } from 'fs';

export default new NativeFunction({
    name: "$execution",
    description: "Executes code exported as a string from the specified file",
    version: "1.0.0",
    output: ArgType.Unknown,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "path",
            description: "File path",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [path]) {
        try {
            const full = resolve(process.cwd(), path);
            if (!existsSync(full)) return this.stop();
            let code = require(full);
            if (typeof code === "object") {
                code = code.code;
            }
            const result = await Interpreter.run({
                ...ctx.runtime,
                data: Compiler.compile(code)
            });
            return result === null ? this.stop() : this.success(result);
        } catch (error:unknown) {
            Logger.error(error);
            return this.error(error as Error);
        }
    }
});