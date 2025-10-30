import { ForgeExtension, FunctionManager, type ForgeClient } from "@tryforge/forgescript";
import { name, description, version } from '../package.json'
import { resolve, extname } from "path";
import { globSync } from "fs";

export class QuorielExtension extends ForgeExtension {
    public readonly name = name
    public readonly description = description
    public readonly version = version

    public init(client: ForgeClient) {
        // The internal handler doesn't support
        // Dynamic script extension
        // eg. .mjs, .ts, .cjs
        const fnEntrypoints = globSync(`${__dirname}/functions/**/*${extname(__filename)}`)
        let modules = []

        for (const fname of fnEntrypoints) {
            const module = require(fname)
            if ('default' in module) {
                modules.push(module.default)
                continue;
            }

            if (Array.isArray(module)) {
                modules.push(...module)
                continue;
            }

            modules.push(module);
        }

        FunctionManager.addMany(modules)
    }
}