Object.defineProperty(exports, "__esModule", { value: true });
class ISYVariable {
    constructor(isy, id, name, type) {
        this.isy = isy;
        this.id = id;
        this.name = name;
        this.value = undefined;
        this.init = undefined;
        this.type = type;
        this.lastChanged = new Date();
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
