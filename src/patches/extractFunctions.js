const { BaseCommand } = require("@tryforge/forgescript");
const { extract } = require("../extract")
const original = BaseCommand.prototype.setPath;

BaseCommand.prototype.setPath = function (path) {
    original.call(this, path);
    if (path?.endsWith(".js")) {
        this.data.functions = extract(path);
    }
    return this;
};