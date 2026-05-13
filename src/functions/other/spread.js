const { NativeFunction, ArgType, CompiledFunction } = require("@tryforge/forgescript");
const orig = CompiledFunction.prototype["resolveUnhandledArg"];

CompiledFunction.prototype["resolveUnhandledArg"] = async function(ctx, i, ref = []) {
    const arg = this.fn.data.args?.[i];
    if (!arg?.rest) return orig.call(this, ctx, i, ref);
    const fields = this.data.fields?.slice(i) ?? [];
    const values = [];
    for (let x = 0; x < fields.length; x++) {
        const field = fields[x];
        if (field.spread === undefined) {
            field.spread = field.functions?.length === 1 &&
                field.functions[0].fn.data.name === "$spread" &&
                field.value === field.functions[0].data.id;
        }
        if (field.spread) {
            const spreadArg = field.functions[0].data.fields?.[0];
            const resolved = await this["resolveCode"](ctx, spreadArg);
            if (!this["isValidReturnType"](resolved)) return resolved;
            const parts = resolved.value.split(";");
            for (const part of parts) {
                const val = await this["resolveArg"](ctx, arg, { ...field, resolveArg: undefined }, part, ref);
                if (!this["isValidReturnType"](val)) return val;
                values.push(val.value);
            }
        } else {
            const resolved = await this["resolveCode"](ctx, field);
            if (!this["isValidReturnType"](resolved)) return resolved;
            const val = await this["resolveArg"](ctx, arg, field, resolved.value, ref);
            if (!this["isValidReturnType"](val)) return val;
            values.push(val.value);
        }
    }
    return this.unsafeSuccess(values);
};

exports.default = new NativeFunction({
    name: "$spread",
    description: "Spreads a delimited string as individual rest arguments",
    version: "1.0.0",
    brackets: true,
    unwrap: true,
    args: [{
        name: "value",
        description: "Semicolon-delimited string to spread",
        type: ArgType.String,
        required: true,
        rest: false,
    }],
    execute(ctx) {
        return this.success();
    }
});