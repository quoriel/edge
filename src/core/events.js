const { Emitter } = require("@eolthar/events");
const { Interpreter, Compiler } = require("@tryforge/forgescript");
const { clearCache, scanDirectory } = require("./fs");
const { extract } = require("./extract");
const { Command } = require("../structures/command");
const { compileAllowed, compileRules, compileOnly, matchesOnly } = require("./matchers");
const { join } = require("path");

const interactions = new Emitter();
const commands = new Emitter();

const paths = new Set();
const prefixes = new Set();

let client = null;

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

function registerCommand(cmd, compiled) {
    if (cmd.data.type === "messageCreate") {
        const filter = compileRules(cmd.data.rules);
        const only = compileOnly(cmd.data.only);
        const handler = async (message, rawArgs, hasPrefix) => {
            if (!filter(message, hasPrefix)) return;
            if (!(await matchesOnly(only, message, client))) return;
            const args = rawArgs ? rawArgs.trim().split(/ +/g).filter(Boolean) : [];
            Interpreter.run({ obj: message, client, data: compiled, command: cmd, args, states: { message: { new: message } } });
        };
        registerHandler(commands, cmd, handler);
    } else {
        const checker = compileAllowed(cmd.data.allowed);
        const handler = (interaction) => {
            if (!checker(interaction)) return;
            Interpreter.run({ obj: interaction, client, data: compiled, command: cmd, args: [] });
        };
        registerHandler(interactions, cmd, handler);
    }
}

function loadFiles(files) {
    for (const file of files) {
        const raw = require(file);
        const mod = raw?.default ?? raw;
        const entries = Array.isArray(mod) ? mod : [mod];
        for (const item of entries) {
            if (!item) continue;
            const cmd = item instanceof Command ? item : new Command(item);
            if (!cmd.validate()) continue;
            const compiled = Compiler.compile(cmd.data.code);
            cmd.data.path = file;
            cmd.data.functions = extract(file);
            registerCommand(cmd, compiled);
        }
    }
}

function registerHandler(map, cmd, handler) {
    map.on(cmd.data.name, handler);
    if (cmd.data.aliases) {
        for (const alias of cmd.data.aliases) {
            map.on(alias, handler);
        }
    }
}

async function loadEvents(path) {
    const resolved = join(process.cwd(), path);
    paths.add(resolved);
    return loadFiles(await scanDirectory(resolved, ".js"));
}

async function updateEvents() {
    interactions.clear();
    commands.clear();
    for (const dir of paths) {
        const files = await scanDirectory(dir, ".js");
        for (const file of files) clearCache(file);
        loadFiles(files);
    }
}

module.exports = { initEvents, loadEvents, updateEvents };