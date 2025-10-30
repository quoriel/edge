/**
 * Trying to make a more dynamic approach
 * for generating metadata
 */

import { ArgType, NativeFunction } from "@tryforge/forgescript";
import { Glob } from "bun";
import z from "zod";
import fs from 'fs'
import { resolve } from 'path'

const sourceDirectory = 'src/functions'
const fileExtension = '.ts'
const glob = new Glob(sourceDirectory + '/**/*' + fileExtension)
var entrypoints = [...glob.scanSync()]
entrypoints = entrypoints.map(x => resolve(process.cwd(), x))

const functions = []

for (const path of entrypoints) {
    const module = require(path)
    if ('default' in module) {
        module.default['path'] = path
        functions.push(module.default)
        continue;
    }

    if (Array.isArray(module)) {
        functions.push(...module.map(x => {
            x['path'] = path;
            return x
        }))
        continue;
    }

    module['path'] = path
    functions.push(module);
}

/**
 * Serves as a template
 */
const template = z.object({
    name: z.string(),
    description: z.string(),
    unwrap: z.boolean(),
    
    // Optional fields
    brackets: z.optional(z.boolean()),
    version: z.optional(z.string()),
    experimental: z.optional(z.boolean()),

    // why does this even exists
    aliases: z.optional(z.array(z.string())),

    // Args
    args: z.optional(z.array(z.object({
        name: z.string(),
        description: z.string(),
        rest: z.boolean(),
        required: z.optional(z.boolean()),
        type: z.number().transform((n) => ArgType[n]),
        enum: z.optional(z.any().transform((x) => Object.values(x).flat())),
        enumName: z.optional(z.string())
    })))
})

const metadata = functions.map((x: NativeFunction) => template.parse(x.data))
const fn = metadata.filter(x => x.args?.filter(x => !!x.enum))
    .map(x => x.args)
    // .reduce((list, x) => [...list, ...x], [])

/**
 * Writing metadata
 */
fs.mkdirSync('./metadata', { recursive: true })

// fs.writeFileSync('./metadata/functions.json', JSON.stringify(metadata))
Bun.file('./metadata/functions.json').write(JSON.stringify(metadata))


// Working with enums
// console.log(fn)