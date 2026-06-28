const { CompiledFunction } = require("@tryforge/forgescript");
const original = CompiledFunction.prototype["resolveUnhandledArg"];

CompiledFunction.prototype.resolveUnhandledArg = async function (ctx, i, ref = []) {
    const arg = this.fn.data.args?.[i];
    if (!arg?.rest) return original.call(this, ctx, i, ref);
    const fields = this.data.fields ?? [];
    const values = [];
    for (let x = i; x < fields.length; x++) {
        const field = fields[x];
        if (field.spread === undefined) {
            const fn = field.functions?.[0];
            if (fn?.fn.data.name === "$spread" && field.value === fn.data.id) {
                field.spread = {
                    fn,
                    sep: fn.data.fields?.[1]?.value || ";",
                    copy: { ...field, resolveArg: undefined }
                };
            } else {
                field.spread = false;
            }
        }
        if (field.spread) {
            const res = await this.resolveCode(ctx, field.spread.fn.data.fields[0]);
            if (!this.isValidReturnType(res)) return res;
            for (const part of res.value.split(field.spread.sep)) {
                const val = await this.resolveArg(ctx, arg, field.spread.copy, part, ref);
                if (!this.isValidReturnType(val)) return val;
                values.push(val.value);
            }
        } else {
            const res = await this.resolveCode(ctx, field);
            if (!this.isValidReturnType(res)) return res;
            const val = await this.resolveArg(ctx, arg, field, res.value, ref);
            if (!this.isValidReturnType(val)) return val;
            values.push(val.value);
        }
    }
    return this.unsafeSuccess(values);
};