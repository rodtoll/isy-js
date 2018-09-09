"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ISYDevice = undefined;

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
                this[prop.id] = Number(prop.value);
                this.formatted[prop.id] = prop.formatted;
                this.uom[prop.id] = prop.uom;
                this.logger(`Property ${_isy.Controls[prop.id].label} (${prop.id}) initialized to: ${this[prop.id]} (${this.formatted[prop.id]})`);
            }
        } else {
            this[node.property.id] = Number(node.property.value);
            this.formatted[node.property.id] = node.property.formatted;
            this.uom[node.property.id] = node.property.uom;
            this.logger(`Property ${_isy.Controls[node.property.id].label} (${node.property.id}) initialized to: ${this[node.property.id]} (${this.formatted[node.property.id]})`);
        }
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

    handlePropertyChange(propertyName, value, formattedValue) {
        var changed = false;
        try {
            if (this[propertyName] != value) {
                this.logger(`Property ${_isy.Controls[propertyName].label} (${propertyName}) updated to: ${value} (${formattedValue})`);
                this[propertyName] = Number(value);
                this.formatted[propertyName] = formattedValue;
                this.lastChanged = new Date();
                changed = true;
            } else {
                this.logger(`Update event triggered, property ${_isy.Controls[propertyName].label} (${propertyName}) is unchanged.`);
            }
            if (changed) {

                this.propertyChanged.emit(propertyName, propertyName, value, formattedValue);
                this.propertyChanged.emit('', propertyName, value, formattedValue);
                this.scenes.forEach(element => {
                    element.recalculateState();
                });
            }
        } finally {
            return changed;
        }
    }
}
exports.ISYDevice = ISYDevice;