var isy = require('./isy.js');
var util = require('util');
var assert = require('assert');

var ISYNodeServerNode = function(isy, name, address, deviceType, nodeSlot, parentNode, nodeDefId) {
    this.isy = isy;
    this.name = name;
    this.address = address;
    this.deviceType = deviceType;
    this.nodeSlot = nodeSlot;
    this.parentNode = parentNode;
    this.nodeDefId = nodeDefId;
    this.deviceFriendlyName = 'ISYv5 Node Server Device';
    this.currentState = 0;
    this.lastChanged = new Date();
};

ISYNodeServerNode.prototype.handleIsyUpdate = function(actionValue) {
    if(actionValue != this.currentState) {
        this.currentState = Number(actionValue);
        this.lastChanged = new Date();
        return true;
    } else {
        return false;
    }
};

ISYNodeServerNode.prototype.handleIsyGenericPropertyUpdate = function(actionValue, prop) {
    if (actionValue != this[prop]) {
        this[prop] = isNaN(actionValue) ? actionValue : Number(actionValue);
        this.lastChanged = new Date();
        this.updatedProperty = prop;
        return true;
    } else {
        return false;
    }
};

ISYNodeServerNode.prototype.getGenericProperty = function(prop) {
    return (this[prop]);
};

ISYNodeServerNode.prototype.markAsChanged = function() {
    this.lastChanged = new Date();
};

ISYNodeServerNode.prototype.getFormattedStatus = function() {
    responseRaw = this;
    delete responseRaw.isy;
    return JSON.stringify(responseRaw, undefined, 3);
};

exports.ISYNodeServerNode = ISYNodeServerNode;