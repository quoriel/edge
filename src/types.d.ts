import type { ForgeClient, ForgeExtension } from "@tryforge/forgescript"

/**
 * The events QuorielEdge is able to route on its own.
 */
export type EventType = "messageCreate" | "interactionCreate"

/**
 * Interaction kinds accepted by the `allowed` field of an `interactionCreate` module.
 */
export type InteractionType =
    | "activityCommand"
    | "autocomplete"
    | "userContextMenu"
    | "messageContextMenu"
    | "contextMenu"
    | "button"
    | "modal"
    | "stringSelect"
    | "userSelect"
    | "roleSelect"
    | "mentionableSelect"
    | "channelSelect"
    | "selectMenu"
    | "messageComponent"
    | "repliable"

/**
 * Optional patches applied through the `features` option.
 */
export type FeatureName = "extractFunctions" | "jsonDirectPass" | "restArgSpread" | "structureDefaults"

/**
 * A plain function declared at the top level of a command file.
 */
export type LocalFunction = (...args: any[]) => unknown

/**
 * Whitelist categories accepted by the `only` field.
 */
export type OnlyType = "users" | "channels" | "guilds" | "categories"

/**
 * Whitelist by ID. Entries containing `$` are evaluated as ForgeScript expressions.
 */
export type Only = Partial<Record<OnlyType, string[]>>

/**
 * Message filters for `messageCreate` modules. An absent key is not checked at all.
 */
export interface Rules {
    /**
     * `true` - prefixed messages only, `false` - unprefixed only.
     */
    prefixed?: boolean

    /**
     * `true` - humans only, `false` - bots only.
     */
    users?: boolean

    /**
     * `true` - guilds only, `false` - direct messages only.
     */
    guilds?: boolean

    /**
     * `true` - plain guild channels only, excluding threads and NSFW.
     */
    channels?: boolean

    /**
     * `true` - threads only.
     */
    threads?: boolean

    /**
     * `true` - NSFW channels only.
     */
    nsfw?: boolean
}

/**
 * The shape of a command or interaction module.
 */
export interface CommandData {
    /**
     * Command name, or the leading part of an interaction custom ID.
     */
    name: string

    /**
     * The event this module reacts to.
     */
    type: EventType

    /**
     * The ForgeScript code to execute.
     */
    code: string

    /**
     * Alternative names this module also answers to.
     */
    aliases?: string[]

    /**
     * Message filters, `messageCreate` only.
     */
    rules?: Rules

    /**
     * Whitelist by ID, `messageCreate` only.
     */
    only?: Only

    /**
     * Allowed interaction kinds, `interactionCreate` only.
     */
    allowed?: InteractionType[]

    [key: string]: unknown
}

/**
 * Options accepted by the `QuorielEdge` constructor.
 */
export interface QuorielEdgeOptions {
    /**
     * The events to listen to and route.
     */
    events?: EventType[]

    /**
     * Prefixes for text commands, required for `messageCreate`.
     * Entries containing `$` are evaluated as ForgeScript expressions.
     */
    prefixes?: string[]

    /**
     * The separator used to cut interaction custom IDs, defaults to `-`.
     */
    separator?: string

    /**
     * Names of the in-memory cache tables to create.
     */
    caches?: string[]

    /**
     * Patches to apply to ForgeScript.
     */
    features?: FeatureName[]
}

/**
 * Loads a folder recursively.
 */
export interface Loader {
    load(path: string): Promise<void>
}

/**
 * A loaded command or interaction module.
 */
export declare class Command {
    constructor(data: CommandData)

    /**
     * Unique identifier assigned on construction.
     */
    id: string

    data: CommandData

    /**
     * Whether `name`, `code` and a known `type` are present.
     */
    validate(): boolean
}

export declare class QuorielEdge extends ForgeExtension {
    constructor(options?: QuorielEdgeOptions)

    name: string
    description: string
    version: string

    options?: QuorielEdgeOptions

    /**
     * Loads a folder of `messageCreate` and `interactionCreate` modules.
     */
    commands: Loader

    /**
     * Loads a folder of JSON schemas holding default environment values.
     */
    structures: Loader

    init(client: ForgeClient): void
}

/**
 * Fills a value with the defaults declared by the structure matching `root`.
 * Requires the `structureDefaults` feature and a loaded structures folder.
 */
export declare function resolveDefault(value: unknown, root: string, ...path: string[]): unknown

/**
 * The features the extension was initialised with. Populated by `init`,
 * empty before it runs.
 */
export declare const features: ReadonlySet<FeatureName>

/**
 * Compiles a CommonJS file with its exports stripped and returns every
 * top-level function it declares, keyed by name.
 */
export declare function extractFunctions(path: string): Record<string, LocalFunction>
