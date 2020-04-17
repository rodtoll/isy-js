Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class ISYVariable extends events_1.EventEmitter {
    constructor(isy, id, name, type) {
        super();
        this.isy = isy;
        this.id = id;
        this.name = name;
        this.value = undefined;
        this.init = undefined;
        this.type = type;
        this.lastChanged = new Date();
    }
    handleEvent(event) {
        const varNode = event.eventInfo.var;
        if (varNode !== null) {
            const id = varNode.id;
            const type = varNode.type;
            const priorVal = this.value;
            this.value = parseInt(varNode.val);
            const year = parseInt(varNode.ts.substr(0, 4));
            const month = parseInt(varNode.ts.substr(4, 2));
            const day = parseInt(varNode.ts.substr(6, 2));
            const hour = parseInt(varNode.ts.substr(9, 2));
            const min = parseInt(varNode.ts.substr(12, 2));
            const sec = parseInt(varNode.ts.substr(15, 2));
            this.lastChanged = new Date(year, month, day, hour, min, sec);
            this.emit('ValueChanged', this.value, priorVal);
        }
    }
    markAsChanged() {
        this.lastChanged = new Date();
    }
    sendSetValue(value, onComplete) {
        this.isy.sendSetVariable(this.id, this.type, value, (success) => onComplete(success));
    }
    async updateValue(value) {
        const p = await this.isy.callISY(`vars\\${this.type}\\${this.id}\\${value}`);
        this.value = value;
        return p;
    }
}
exports.ISYVariable = ISYVariable;
