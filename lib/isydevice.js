"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isynode_1 = require("./isynode");
const isyconstants_1 = require("./isyconstants");
const isy_1 = require("./isy");
class ISYDevice extends isynode_1.ISYNode {
    constructor(isy, node) {
        super(isy, node);
        this.scenes = [];
        this.formatted = {};
        this.uom = {};
        this.nodeType = 1;
        this.type = node.type;
        this._enabled = node.enabled;
        this.deviceClass = node.deviceClass;
        this.parentAddress = node.pnode;
        let s = this.type.split('.');
        this.category = Number(s[0]);
        this.subCategory = Number(s[1]);
        //console.log(nodeDetail);
        if (this.parentAddress !== this.address && this.parentAddress !== undefined)
            this._parentDevice = isy.getDevice(this.parentAddress);
        if (Array.isArray(node.property)) {
            for (var prop of node.property) {
                this[prop.id] = this.convertFrom(Number(prop.value), Number(prop.uom));
                this.formatted[prop.id] = prop.formatted;
                this.uom[prop.id] = prop.uom;
                this.logger(`Property ${isy_1.Controls[prop.id].label} (${prop.id}) initialized to: ${this[prop.id]} (${this.formatted[prop.id]})`);
            }
        }
        else {
            this[node.property.id] = this.convertFrom(Number(node.property.value), Number(node.property.uom));
            this.formatted[node.property.id] = node.property.formatted;
            this.uom[node.property.id] = node.property.uom;
            this.logger(`Property ${isy_1.Controls[node.property.id].label} (${node.property.id}) initialized to: ${this[node.property.id]} (${this.formatted[node.property.id]})`);
        }
    }
    convertTo(value, uom) {
        return value;
    }
    convertFrom(value, uom) {
        return value;
    }
    addLink(isyScene) {
        this.scenes.push(isyScene);
    }
    get parentDevice() {
        if (this._parentDevice === undefined) {
            if (this.parentAddress !== this.address && this.parentAddress !== null && this.parentAddress !== undefined)
                this._parentDevice = this.isy.getDevice(this.parentAddress);
            this._parentDevice = null;
        }
        return this._parentDevice;
    }
    async updateProperty(propertyName, value) {
        let val = this.convertTo(Number(value), Number(this.uom[propertyName]));
        this.logger("Updating property " + isy_1.Controls[propertyName].label + ". incoming value: " + value + " outgoing value: " + val);
        return this.isy.sendISYCommand(`nodes/${this.address}/set/${propertyName}/${val}`);
    }
    async sendCommand(command, ...parameters) {
        return this.isy.sendNodeCommand(this, command, ...parameters);
    }
    handlePropertyChange(propertyName, value, formattedValue) {
        var changed = false;
        try {
            let val = this.convertFrom(Number(value), Number(this.uom[propertyName]));
            if (this[propertyName] !== val) {
                this.logger(`Property ${isy_1.Controls[propertyName].label} (${propertyName}) updated to: ${val} (${formattedValue})`);
                this[propertyName] = val;
                this.formatted[propertyName] = formattedValue;
                this.lastChanged = new Date();
                changed = true;
            }
            else {
                this.logger(`Update event triggered, property ${isy_1.Controls[propertyName].label} (${propertyName}) is unchanged.`);
            }
            if (changed) {
                this.propertyChanged.emit(propertyName, propertyName, val, formattedValue);
                this.propertyChanged.emit('', propertyName, val, formattedValue);
                this.scenes.forEach(element => {
                    this.logger("Recalulating " + element.name);
                    element.recalculateState();
                });
            }
        }
        finally {
            return changed;
        }
    }
}
exports.ISYDevice = ISYDevice;
exports.ISYBinaryStateDevice = (Base) => {
    return class extends Base {
        get state() {
            return this.ST > 0;
        }
        async updateState(state) {
            if (state !== this.state) {
                return this.sendCommand((state) ? isyconstants_1.Commands.On : isyconstants_1.Commands.Off);
            }
            return Promise.resolve({});
        }
    };
};
exports.ISYLevelDevice = (base) => class extends base {
    get level() {
        return this.ST;
    }
    async updateLevel(level) {
        if (level !== this.level) {
            if (level > 0)
                return this.sendCommand(isyconstants_1.Commands.On, this.convertTo(level, Number(this.uom.ST)));
            else
                return this.sendCommand(isyconstants_1.Commands.Off);
        }
        return Promise.resolve({});
    }
};
