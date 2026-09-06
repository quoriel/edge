const { BaseCommand } = require("@tryforge/forgescript");
const { extractFunctions } = require("../core/extract");
const original = BaseCommand.prototype.setPath;

BaseCommand.prototype.setPath = function (path) {
    original.call(this, path);
    if (path?.endsWith(".js")) {
        this.data.functions = extractFunctions(path);
    }
    return this;
};