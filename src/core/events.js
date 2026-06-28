const { Emitter } = require("@eolthar/events");
const { Compiler, Interpreter } = require("@tryforge/forgescript");
const { extract } = require("./extract");
const { clearCache } = require("./utils");
const { readdir } = require("fs/promises");
const { join } = require("path");

const interactions = new Emitter();
const commands = new Emitter();

const paths = new Set();
const prefixes = new Set();

let client = null;
let id = 0;

const methodMap = {
    activityCommand: "isPrimaryEntryPointCommand",
    autocomplete: "isAutocomplete",
    userContextMenu: "isUserContextMenuCommand",
    messageContextMenu: "isMessageContextMenuCommand",
    contextMenu: "isContextMenuCommand",
    button: "isButton",
    modal: "isModalSubmit",
    stringSelect: "isStringSelectMenu",
    userSelect: "isUserSelectMenu",
    roleSelect: "isRoleSelectMenu",
    mentionableSelect: "isMentionableSelectMenu",
    channelSelect: "isChannelSelectMenu",
    selectMenu: "isAnySelectMenu",
    messageComponent: "isMessageComponent",
    repliable: "isRepliable"
};

const onlyGetters = {
    users: (m) => m.author.id,
    channels: (m) => m.channel?.id,
    guilds: (m) => m.guild?.id,
    categories: (m) => m.channel?.parent?.id
};

function initEvents(secret, options) {
    client = secret;
    if (options?.prefixes) {
        for (const value of options.prefixes) {
            const is = value.includes("$");
            prefixes.add({
                compiled: is ? Compiler.compile(value) : null,
                static: is ? null : value
            });
        }
    }
    const sep = options.separator || "-";
    if (options.events.includes("interactionCreate")) {
        client.on("interactionCreate", (interaction) => {
            if (interaction.isChatInputCommand()) return;
            const raw = interaction.customId || interaction.commandName;
            const sp = raw.indexOf(sep);
            interactions.emit(sp !== -1 ? raw.substring(0, sp) : raw, interaction);
        });
    }
    if (options.events.includes("messageCreate")) {
        client.on("messageCreate", async (message) => {
            const content = message.content.trim();
            const sp = content.indexOf(" ");
            const raw = (sp !== -1 ? content.substring(0, sp) : content).toLowerCase();
            if (!raw) return;
            const prefix = await getPrefix(message, raw);
            const name = prefix ? raw.substring(prefix.length) : raw;
            commands.emit(name, message, sp !== -1 ? content.substring(sp + 1) : "", prefix !== null);
        });
    }
}

async function getPrefix(message, raw) {
    for (const value of prefixes) {
        const resolved =
            value.static ??
            (await Interpreter.run({
                client,
                command: null,
                data: value.compiled,
                obj: message,
                doNotSend: true
            }));
        if (raw.startsWith(resolved)) return resolved;
    }
    return null;
}

function compileChecker(allowed) {
    if (!allowed?.length) return () => true;
    let body = `i.${methodMap[allowed[0]]}()`;
    for (let i = 1; i < allowed.length; i++) {
        body += ` || i.${methodMap[allowed[i]]}()`;
    }
    return eval(`(function(i){return ${body};})`);
}

function compileFilter(rules) {
    const r = rules ?? { prefixed: true, guilds: true, users: true };
    const parts = [];
    if ("prefixed" in r) parts.push(r.prefixed ? "p" : "!p");
    if ("users" in r) parts.push(r.users ? "!m.author.bot" : "m.author.bot");
    if ("guilds" in r) parts.push(r.guilds ? "m.guild" : "!m.guild");
    const keys = ["channels", "threads", "nsfw"];
    let any = false;
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] in r) {
            any = true;
            break;
        }
    }
    if (any) {
        const sub = [];
        if (r.channels) sub.push("(!m.channel?.isThread()&&!m.channel?.nsfw)");
        if (r.threads) sub.push("m.channel?.isThread()");
        if (r.nsfw) sub.push("m.channel?.nsfw");
        const expr = sub.length ? `(${sub.join("||")})` : "false";
        parts.push(!("guilds" in r) ? `(!m.guild||${expr})` : expr);
    }
    if (!parts.length) return () => true;
    return eval(`(function(m,p){return ${parts.join("&&")};})`);
}

function buildOnly(only) {
    if (!only) return null;
    const result = {};
    for (const type in only) {
        const ids = only[type];
        const compiled = new Array(ids.length);
        for (let i = 0; i < ids.length; i++) {
            const dynamic = ids[i].includes("$");
            compiled[i] = {
                compiled: dynamic ? Compiler.compile(ids[i]) : null,
                static: dynamic ? null : ids[i]
            };
        }
        result[type] = compiled;
    }
    return result;
}

async function checkOnly(only, message) {
    if (!only) return true;
    for (const type in only) {
        const actual = onlyGetters[type]?.(message);
        if (!actual) return false;
        const entries = only[type];
        let matched = false;
        for (let i = 0; i < entries.length; i++) {
            const resolved =
                entries[i].static ??
                (await Interpreter.run({
                    client,
                    command: null,
                    data: entries[i].compiled,
                    obj: message,
                    doNotSend: true
                }));
            if (resolved === actual) {
                matched = true;
                break;
            }
        }
        if (!matched) return false;
    }
    return true;
}

function loadFiles(files) {
    for (const file of files) {
        const raw = require(file);
        const mod = raw?.default ?? raw;
        const entries = Array.isArray(mod) ? mod : [mod];
        for (const data of entries) {
            if (!data?.name || !data?.code) continue;
            const compiled = Compiler.compile(data.code);
            const stub = {
                id: `edge_${++id}`,
                data: { ...data, path: file, functions: extract(file) }
            };
            if (data.type === "messageCreate") {
                const filter = compileFilter(data.rules);
                const only = buildOnly(data.only);
                const handler = async (message, rawArgs, hasPrefix) => {
                    if (!filter(message, hasPrefix)) return;
                    if (!(await checkOnly(only, message))) return;
                    const args = rawArgs ? rawArgs.trim().split(/ +/g).filter(Boolean) : [];
                    Interpreter.run({ obj: message, client, data: compiled, command: stub, args, states: { message: { new: message } } });
                };
                registerHandler(commands, data, handler);
            } else if (data.type === "interactionCreate") {
                const checker = compileChecker(data.allowed);
                const handler = (interaction) => {
                    if (!checker(interaction)) return;
                    Interpreter.run({ obj: interaction, client, data: compiled, command: stub, args: [] });
                };
                registerHandler(interactions, data, handler);
            }
        }
    }
}

function registerHandler(map, data, handler) {
    map.on(data.name, handler);
    if (data.aliases) {
        for (const alias of data.aliases) {
            map.on(alias, handler);
        }
    }
}

async function scanRoutes(dir) {
    const results = [];
    const files = await readdir(dir, { withFileTypes: true });
    for (const file of files) {
        const full = join(dir, file.name);
        if (file.isDirectory()) results.push(...(await scanRoutes(full)));
        else if (file.name.endsWith(".js")) results.push(full);
    }
    return results;
}

async function loadEvents(path) {
    const resolved = join(process.cwd(), path);
    paths.add(resolved);
    return loadFiles(await scanRoutes(resolved));
}

async function updateEvents() {
    interactions.clear();
    commands.clear();
    for (const dir of paths) {
        const files = await scanRoutes(dir);
        for (const file of files) clearCache(file);
        loadFiles(files);
    }
}

module.exports = { initEvents, loadEvents, updateEvents };
