let id = 0;

class Command {
    id = `edge_${++id}`;
    data;
    constructor(data) {
        this.data = { ...data };
    }
    validate() {
        return !!this.data.name && !!this.data.code && (this.data.type === "messageCreate" || this.data.type === "interactionCreate");
    }
}

module.exports = { Command };