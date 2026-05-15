const { NativeFunction, ArgType, CompiledFunction } = require("@tryforge/forgescript");
const orig = CompiledFunction.prototype["resolveUnhandledArg"];

CompiledFunction.prototype["resolveUnhandledArg"] = async function(ctx, i, ref = []) {
    const arg = this.fn.data.args?.[i];
    if (!arg?.rest) return orig.call(this, ctx, i, ref);
    const all = this.data.fields ?? [];
    const values = [];
    for (let x = i; x < all.length; x++) {
        const field = all[x];
        if (field.spread === undefined) {
            const fns = field.functions?.[0];
            field.spread = (fns?.fn.data.name === "$spread" && field.value === fns.data.id) ? fns : false;
        }
        if (field.spread) {
            const res = await this["resolveCode"](ctx, field.spread.data.fields[0]);
            if (!this["isValidReturnType"](res)) return res;
            for (const part of res.value.split(field.spread.data.fields?.[1]?.value || ";")) {
                const val = await this["resolveArg"](ctx, arg, { ...field, resolveArg: undefined }, part, ref);
                if (!this["isValidReturnType"](val)) return val;
                values.push(val.value);
            }
        } else {
            const res = await this["resolveCode"](ctx, field);
            if (!this["isValidReturnType"](res)) return res;
            const val = await this["resolveArg"](ctx, arg, field, res.value, ref);
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
    args: [
        {
            name: "value",
            description: "Delimited string to spread",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "separator",
            description: "Separator character",
            type: ArgType.String,
            required: false,
            rest: false
        }
    ],
    execute(ctx) {
        return this.success();
    }
});