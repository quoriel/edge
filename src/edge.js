const { Emitter } = require("@eolthar/events");
const { Compiler, Interpreter } = require("@tryforge/forgescript");
const { readdir } = require("fs/promises");
const { join } = require("path");

const interactions = new Emitter();
const commands = new Emitter();

const cache = new Map();
const functions = new Map();
const paths = new Set();
const prefixes = new Set();

let client = null;

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

function init(climat, options) {
    client = climat;
    if (options?.prefix) {
        const arr = Array.isArray(options.prefix) ? options.prefix : [options.prefix];
        for (const value of arr) {
            prefixes.add({
                compiled: Compiler.compile(value),
                static: !value.includes("$") ? value : null
            });
        }
    }
}

async function getPrefix(message) {
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
        if (message.content.startsWith(resolved)) {
            return resolved;
        }
    }
    return null;
}

function jsonMath(ctx, keys, op) {
    const val = +keys.pop();
    const num = ctx.getEnvironmentKey(...keys);
    const nex = op(+num || 0, val);
    return ctx.traverseAddEnvironmentKey(typeof num === "string" ? nex + "" : nex, ...keys);
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

function loadFiles(files) {
    for (const file of files) {
        const raw = require(file);
        const mod = raw?.default ?? raw;
        const entries = Array.isArray(mod) ? mod : [mod];
        for (const data of entries) {
            if (!data?.name || !data?.code) continue;
            const compiled = Compiler.compile(data.code);
            const names = Array.isArray(data.name) ? data.name : [data.name];
            const checker = compileChecker(data.allowed);
            if (data.type === "messageCreate") {
                const handler = (message, args) => {
                    Interpreter.run({ obj: message, client, data: compiled, command: null, args, states: { message: { new: message } } });
                };
                for (const name of names) commands.on(name, handler);
            } else if (data.type === "interactionCreate") {
                const handler = (interaction) => {
                    if (!checker(interaction)) return;
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

module.exports = { interactions, commands, cache, functions, init, getPrefix, jsonMath, loadEvents, updateEvents, clearCache };
