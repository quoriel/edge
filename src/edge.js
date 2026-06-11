const { Emitter } = require("@eolthar/events");
const { Compiler, Interpreter } = require("@tryforge/forgescript");
const { readdir } = require("fs/promises");
const { join } = require("path");

const interactions = new Emitter();
const commands = new Emitter();

const cache = new Map();
const functions = new Map();
const paths = new Set();

let client = null;

function init(clt) {
    client = clt;
}

function jsonMath(ctx, keys, op) {
    const val = +keys.pop();
    const num = ctx.getEnvironmentKey(...keys);
    const nex = op(+num || 0, val);
    return ctx.traverseAddEnvironmentKey(typeof num === "string" ? nex + "" : nex, ...keys);
}

function interactionType(interaction) {
    if (interaction.isChatInputCommand())          return "slashCommand";
    if (interaction.isPrimaryEntryPointCommand())  return "activityCommand";
    if (interaction.isAutocomplete())              return "autocomplete";
    if (interaction.isContextMenuCommand())        return "contextMenu";
    if (interaction.isUserContextMenuCommand())    return "userContextMenu";
    if (interaction.isMessageContextMenuCommand()) return "messageContextMenu";
    if (interaction.isCommand())                   return "command";
    if (interaction.isButton())                    return "button";
    if (interaction.isModalSubmit())               return "modal";
    if (interaction.isStringSelectMenu())          return "stringSelect";
    if (interaction.isUserSelectMenu())            return "userSelect";
    if (interaction.isRoleSelectMenu())            return "roleSelect";
    if (interaction.isMentionableSelectMenu())     return "mentionableSelect";
    if (interaction.isChannelSelectMenu())         return "channelSelect";
    if (interaction.isAnySelectMenu())             return "selectMenu";
    if (interaction.isMessageComponent())          return "messageComponent";
    if (interaction.isRepliable())                 return "repliable";
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

async function loadFiles(files) {
    for (const file of files) {
        const raw = require(file);
        const entries = Array.isArray(raw) ? raw : [raw];
        for (const data of entries) {
            if (!data?.name || !data?.code) continue;
            const compiled = Compiler.compile(data.code);
            const allowed = data.allowed?.length ? new Set(data.allowed) : null;
            const names = Array.isArray(data.name) ? data.name : [data.name];
            if (data.type === "messageCreate") {
                const handler = (message, args) => {
                    Interpreter.run({ obj: message, client, data: compiled, command: null, args, states: { message: { new: message } } });
                };
                for (const name of names) commands.on(name, handler);
            } else if (data.type === "interactionCreate") {
                const handler = (interaction) => {
                    if (allowed) {
                        const type = interactionType(interaction);
                        if (!type || !allowed.has(type)) return;
                    }
                    Interpreter.run({ obj: interaction, client, data: compiled, command: null, args: [] });
                };
                for (const name of names) interactions.on(name, handler);
            }
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

function clearCache(path) {
    const mod = require.cache[path];
    if (!mod) return;
    for (let i = 0, l = mod.children.length; i < l; i++) clearCache(mod.children[i].id);
    delete require.cache[path];
}

module.exports = { interactions, commands, cache, functions, init, jsonMath, loadEvents, updateEvents, clearCache };
