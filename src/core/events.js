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
    command: "isCommand",
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

const filterMap = {
    threads: "m.channel?.isThread()",
    nsfw: "m.channel?.nsfw",
    webhooks: "m.webhookId",
    system: "m.system",
    partials: "m.partial",
    pinned: "m.pinned"
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

function compileChecker(allowed) {
    if (!allowed?.length) return () => true;
    let body = `i.${methodMap[allowed[0]]}()`;
    for (let i = 1; i < allowed.length; i++) {
        body += ` || i.${methodMap[allowed[i]]}()`;
    }
    return eval(`(function(i){return ${body};})`);
}

function compileFilter(allowed) {
    const is = allowed?.includes("unprefixed") ?? false;
    let filters;
    if (allowed) {
        filters = new Set(allowed.filter((f) => f !== "unprefixed"));
    } else {
        filters = new Set(["users", "guilds"]);
    }
    let body = is ? "!p" : "p";
    const hasBots = filters.has("bots");
    const hasUsers = filters.has("users");
    if (hasBots && !hasUsers) body += `&&m.author.bot`;
    else if (hasUsers && !hasBots) body += `&&!m.author.bot`;
    const hasGuilds = filters.has("guilds");
    const hasDms = filters.has("dms");
    if (hasGuilds && !hasDms) body += `&&m.guild`;
    else if (hasDms && !hasGuilds) body += `&&!m.guild`;
    for (const key in filterMap) {
        if (filters.has(key)) body += `&&!${filterMap[key]}`;
    }
    return eval(`(function(m,p){return ${body};})`);
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
                const filter = compileFilter(data.allowed);
                const handler = (message, rawArgs, hasPrefix) => {
                    if (!filter(message, hasPrefix)) return;
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

async function loadEvents(path) {
    const resolved = join(process.cwd(), path);
    paths.add(resolved);
    return loadFiles(await scanRoutes(resolved));
}

async function updateEvents() {
    const promises = [];
    interactions.clear();
    commands.clear();
    for (const path of paths) {
        const files = await scanRoutes(path);
        for (const file of files) clearCache(file);
        promises.push(loadFiles(files));
    }
    return Promise.all(promises);
}

module.exports = { initEvents, loadEvents, updateEvents };