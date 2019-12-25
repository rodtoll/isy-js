"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const isy_1 = require("./isy");
class ISYNode {
    constructor(isy, node) {
        this.isy = isy;
        this.nodeType = 0;
        this.flag = node.flag;
        this.nodeDefId = node.nodeDefId;
        this.address = node.address;
        this.name = node.name;
        this.family = node.family;
        this.parent = node.parent;
        this.parentType = node.parent.type;
        this.enabled = node.enabled;
        this.elkId = node.ELK_ID;
        this.propertyChanged = new events_1.EventEmitter();
        this.propsInitialized = false;
        this.logger = (msg) => {
            return isy.logger(`${this.name} (${this.address}): ${msg}`);
        };
        if (this.parentType === 3) {
            this.folder = isy.folderMap.get(this.parent);
        }
        this.logger(this.nodeDefId);
        this.lastChanged = new Date();
    }
    handlePropertyChange(propertyName, value, formattedValue) {
        this.lastChanged = new Date();
        return true;
    }
    handleEvent(event) {
        let actionValue = null;
        if (event.action instanceof Object) {
            actionValue = event.action._;
        }
        else if (event.action instanceof Number || event.action instanceof String) {
            actionValue = Number(event.action);
        }
        if (event.control in this) {
            // property not command
            const formatted = 'fmtAct' in event ? event.fmtAct : actionValue;
            return this.handlePropertyChange(event.control, actionValue, formatted);
        }
        else {
            // this.logger(event.control);
            const e = event.control;
            const dispName = isy_1.Controls[e];
            if (dispName !== undefined && dispName !== null) {
                this.logger(`Command ${dispName.label} (${e}) triggered.`);
            }
            else {
                this.logger(`Command ${e} triggered.`);
            }
            return false;
        }
    }
    onPropertyChanged(propertyName = null, callback) {
        if (propertyName === null) {
            this.propertyChanged.addListener('', callback);
        }
        else {
            this.propertyChanged.addListener(propertyName, callback);
        }
    }
}
exports.ISYNode = ISYNode;
