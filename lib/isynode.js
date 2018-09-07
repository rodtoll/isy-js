"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ISYNode = undefined;

var _events = require("events");

class ISYNode {
    constructor(isy, node) {

        this.isy = isy;
        this._nodeType = 0;
        this.flag = node["@flag"];
        this.nodeDefId = node["@nodeDefId"];
        this.address = node.address;
        this.name = node.name;
        this.family = node.family;
        this.parent = node.parent;
        this.elkId = node.ELK_ID;
        this.propertyChanged = new _events.EventEmitter();
        this.logger = msg => {
            return isy.logger(`${this.name} (${this.address}): ${msg}`);
        };
        this.lastChanged = new Date();
    }

    onPropertyChanged(propertyName, callback) {
        this.propertyChanged.addListener(propertyName, callback);
    }

    onPropertyChanged(callback) {

        this.propertyChanged.addListener('', callback);
    }

}
exports.ISYNode = ISYNode; //import { ISY } from "./isy";