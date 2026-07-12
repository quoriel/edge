const { Compiler, Interpreter } = require("@tryforge/forgescript");

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

function compileAllowed(allowed) {
    if (!allowed?.length) return () => true;
    let body = `i.${methodMap[allowed[0]]}()`;
    for (let i = 1; i < allowed.length; i++) {
        body += ` || i.${methodMap[allowed[i]]}()`;
    }
    return eval(`(function(i){return ${body};})`);
}

function compileRules(rules) {
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

function compileOnly(only) {
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

async function matchesOnly(only, message, client) {
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

module.exports = { compileAllowed, compileRules, compileOnly, matchesOnly };