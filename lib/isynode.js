"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ISYNode = undefined;

var _isy = require("./isy");

var _events = require("events");

var _async_hooks = require("async_hooks");

class ISYNode {
    constructor(isy, node) {

        this.isy = isy;
        this._nodeType = 0;
        this.flag = node["flag"];
        this.nodeDefId = node["nodeDefId"];

        this.address = node.address;
        this.name = node.name;
        this.family = node.family;
        this.parent = node.parent;
        this.elkId = node.ELK_ID;
        this.propertyChanged = new _events.EventEmitter();
        this.propsInitialized = false;
        this.logger = msg => {
            return isy.logger(`${this.name} (${this.address}): ${msg}`);
        };
        this.logger(this.nodeDefId);
        this.lastChanged = new Date();
    }

    handlePropertyChange(propertyName, value, formattedValue) {
        return true;
    }

    handleEvent(event) {

        let actionValue = null;
        if (event.action instanceof Object) {
            actionValue = event.action._;
        } else if (event.action instanceof Number || event.action instanceof String) {
            actionValue = Number(event.action);
        }

        if (event.control in this) {
            //property not command
            var formatted = "fmtAct" in event ? event.fmtAct : actionValue;
            return this.handlePropertyChange(event.control, actionValue, formatted);
        } else {
            //this.logger(event.control);
            var e = event.control;
            var dispName = _isy.Controls[e];
            if (dispName !== undefined && dispName !== null) {
                this.logger(`Command ${dispName.label} (${e}) triggered.`);
            } else {
                this.logger(`Command ${e} triggered.`);
            }
            return false;
        }
    }

    onPropertyChanged(propertyName, callback) {
        this.propertyChanged.addListener(propertyName, callback);
    }

    onPropertyChanged(callback) {

        this.propertyChanged.addListener('', callback);
    }

}
exports.ISYNode = ISYNode;