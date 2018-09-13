"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ISYLevelDevice = exports.ISYBinaryStateDevice = exports.ISYDevice = undefined;

var _ISYNode = require("./ISYNode");

var _isyconstants = require("./isyconstants");

var _isy = require("./isy");

class ISYDevice extends _ISYNode.ISYNode {
    constructor(isy, node) {
        super(isy, node);
        this._nodeType = _isyconstants.NodeTypes.device;
        this._type = node.type;
        this._enabled = node.enabled;
        this.deviceClass = node.deviceClass;
        this._parentAddress = node.pnode;
        let s = this.type.split('.');
        this._category = Number(s[0]);
        this._subCategory = Number(s[1]);
        this.scenes = [];
        this.formatted = {};
        this.uom = {};
        //console.log(nodeDetail);
        if (this._parentAddress != this.address && this._parentAddress !== undefined) this._parentDevice = isy.getDevice(this._parentAddress);
        if (Array.isArray(node.property)) {
            for (var prop of node.property) {
                this[prop.id] = this.convertFrom(Number(prop.value), prop.uom);
                this.formatted[prop.id] = prop.formatted;
                this.uom[prop.id] = prop.uom;
                this.logger(`Property ${_isy.Controls[prop.id].label} (${prop.id}) initialized to: ${this[prop.id]} (${this.formatted[prop.id]})`);
            }
        } else {
            this[node.property.id] = this.convertFrom(Number(node.property.value), node.property.uom);
            this.formatted[node.property.id] = node.property.formatted;
            this.uom[node.property.id] = node.property.uom;
            this.logger(`Property ${_isy.Controls[node.property.id].label} (${node.property.id}) initialized to: ${this[node.property.id]} (${this.formatted[node.property.id]})`);
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
    get nodeType() {
        return _isyconstants.NodeTypes.device;
    }
    get type() {
        return this._type;
    }
    get parentAddress() {
        return this._type;
    }

    get enabled() {
        return this._enabled;
    }

    get parentDevice() {
        if (this._parentDevice === undefined) {
            if (this._parentAddress !== this.address && this._parentAddress !== null && this._parentAddress !== undefined) this._parentDevice = this.isy.getDevice(this._parentAddress);
            this._parentDevice = null;
        }
        return this._parentDevice;
    }

    updateProperty(propertyName, value, resultHandler) {

        let val = this.convertTo(value, this.uom[propertyName]);
        this.logger("Updating property " + _isy.Controls[propertyName].label + ". incoming value: " + value + " outgoing value: " + val);
        this.isy.sendISYCommand(`nodes/${this.address}/set/${propertyName}/${val}`, resultHandler);
    }

    sendCommand(command, resultHandler, ...parameters) {
        this.isy.sendRestCommand(this.address, command, parameters, resultHandler);
    }

    handlePropertyChange(propertyName, value, formattedValue) {
        var changed = false;
        try {
            let val = this.convertFrom(Number(value), this.uom[propertyName]);
            if (this[propertyName] != val) {
                this.logger(`Property ${_isy.Controls[propertyName].label} (${propertyName}) updated to: ${val} (${formattedValue})`);
                this[propertyName] = val;
                this.formatted[propertyName] = formattedValue;
                this.lastChanged = new Date();
                changed = true;
            } else {
                this.logger(`Update event triggered, property ${_isy.Controls[propertyName].label} (${propertyName}) is unchanged.`);
            }
            if (changed) {

                this.propertyChanged.emit(propertyName, propertyName, val, formattedValue);
                this.propertyChanged.emit('', propertyName, val, formattedValue);
                this.scenes.forEach(element => {
                    this.logger("Recalulating " + element.name);
                    element.recalculateState();
                });
            }
        } finally {
            return changed;
        }
    }

}

exports.ISYDevice = ISYDevice;
const ISYBinaryStateDevice = exports.ISYBinaryStateDevice = ISYDevice => class extends ISYDevice {

    get state() {
        return this.ST > 0;
    }

    updateState(state, resultHandler) {
        if (state != this.status) {
            this.sendCommand(state ? _isyconstants.Commands.On : _isyconstants.Commands.Off, resultHandler);
        }
    }

};

const ISYLevelDevice = exports.ISYLevelDevice = ISYDevice => class extends ISYDevice {

    get level() {
        return this.ST;
    }

    updateLevel(level, resultHandler) {

        if (level != this.level) {

            if (level > 0) this.sendCommand(_isyconstants.Commands.On, resultHandler, this.convertTo(level, 100));else this.sendCommand(_isyconstants.Commands.Off, resultHandler);
        }
    }
};