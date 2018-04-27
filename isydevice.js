/* jshint esversion:6 */

var util = require('util');
var assert = require('assert');
var ISYDefs = require("./isydefs.json");

////////////////////////////////////////////////////////////////////////
// ISYBaseDevice
//
// Generic base class which can represent any kind of device.
//
function ISYBaseDevice(isy, name, address, isyType, deviceType, deviceFamily) {
    this.isy = isy;
    this.name = name;
    this.address = address;
    this.isyType = isyType;
    this.deviceType = deviceType;
    this.batteryOperated = false;
    this.connectionType = deviceFamily;
    this.deviceFriendlyName = 'Generic Device';
    this.currentState = 0;
    this.currentState_f = 0;
    this.lastChanged = new Date();
    this.updateType = null;
    this.updatedProperty = null;
}

ISYBaseDevice.prototype.handleIsyUpdate = function(actionValue, formatted = undefined) {
    if (Number(actionValue) != this.currentState) {
        this.currentState = Number(actionValue);
        this.currentState_f = ("formatted" !== undefined) ? ((isNaN(formatted)) ? formatted : Number(formatted)) : Number(actionValue);
        this.lastChanged = new Date();
        return true;
    } else {
        return false;
    }
};

ISYBaseDevice.prototype.handleIsyGenericPropertyUpdate = function(actionValue, prop, formatted = undefined) {
    if (Number(actionValue) != this[prop]) {
        this[prop] = Number(actionValue);
        this[prop + "_f"] = ("formatted" !== undefined) ? ((isNaN(formatted)) ? formatted : Number(formatted)) : Number(actionValue);
        this.lastChanged = new Date();
        this.updatedProperty = prop;
        return true;
    } else {
        return false;
    }
};

ISYBaseDevice.prototype.getGenericProperty = function(prop) {
    return (this[prop]);
};


////////////////////////////////////////////////////////////////////////
// LIGHTS

ISYBaseDevice.prototype.getCurrentLightState = function() {
    return (this.currentState > 0);
};

ISYBaseDevice.prototype.getCurrentLightDimState = function() {
    return Math.floor((this.currentState * ISYDefs.props.dimLevelMaximum) / ISYDedefs.props.isyDimLevelMaximum);
};

ISYBaseDevice.prototype.sendLightCommand = function(command, resultHandler) {
    // command can be passed as an ISY command (DON/DOF/DFOF/DFON), a number 0/100, or a boolean of the current light state to toggle a light
    var cmd = ISYDefs.cmd.lightOn;
    if (typeof command === "boolean") {
        cmd = (command) ? ISYDefs.cmd.lightOn : ISYDefs.cmd.lightOff;
    } else if (typeof command === "number") {
        cmd = (command > 0) ? ISYDefs.cmd.lightOn : ISYDefs.cmd.lightOff;
    } else {
        cmd = command;
    }
    this.isy.sendRestCommand(this.address, cmd, null, resultHandler);
};

ISYBaseDevice.prototype.sendLightDimCommand = function(dimLevel, resultHandler) {
    var isyDimLevel = Math.ceil(dimLevel * ISYDefs.props.isyDimLevelMaximum / ISYDefs.props.dimLevelMaximum);
    this.isy.sendRestCommand(this.address, ISYDefs.cmd.lightOn, isyDimLevel, resultHandler);
};

////////////////////////////////////////////////////////////////////////
// LOCKS

ISYBaseDevice.prototype.getCurrentNonSecureLockState = function() {
    return (this.currentState != ISYDefs.states.lockUnlocked);
};

ISYBaseDevice.prototype.getCurrentSecureLockState = function() {
    return (this.currentState > 0);
};

ISYBaseDevice.prototype.sendNonSecureLockCommand = function(lockState, resultHandler) {
    if (lockState) {
        this.isy.sendRestCommand(this.address, ISYDefs.cmd.lockLock, null, resultHandler);
    } else {
        this.isy.sendRestCommand(this.address, ISYDefs.cmd.lockUnlock, null, resultHandler);
    }
};

ISYBaseDevice.prototype.sendSecureLockCommand = function(lockState, resultHandler) {
    if (lockState) {
        this.isy.sendRestCommand(this.address, ISYDefs.cmd.secureLockBase, ISYDefs.cmd.secureLockParameterLock, resultHandler);
    } else {
        this.isy.sendRestCommand(this.address, ISYDefs.cmd.secureLockBase, ISYDefs.cmd.secureLockParameterUnlock, resultHandler);
    }
};

////////////////////////////////////////////////////////////////////////
// DOOR/WINDOW SENSOR

ISYBaseDevice.prototype.getCurrentDoorWindowState = function() {
    return (this.currentState !== ISYDefs.state.doorWindowClosed);
};

////////////////////////////////////////////////////////////////////////
// OUTLETS

ISYOutletDevice.prototype.getCurrentOutletState = function() {
    return (this.currentState > 0) ? true : false;
};

ISYOutletDevice.prototype.sendOutletCommand = function(command, resultHandler) {
    // command can be passed as an ISY command (DON/DOF), or a boolean of the current light state to toggle
    var cmd = ISYDefs.cmd.outletOn;
    if (typeof command === "boolean") {
        cmd = (command) ? ISYDefs.cmd.outletOn : ISYDefs.cmd.outletOff;
    } else {
        cmd = command;
    }
    this.isy.sendRestCommand(this.address, cmd, null, resultHandler);
};

////////////////////////////////////////////////////////////////////////
// MOTION SENSORS

ISYBaseDevice.prototype.getCurrentMotionSensorState = function() {
    return (this.currentState === ISYDefs.state.motionSensorOn) ? true : false;
};

////////////////////////////////////////////////////////////////////////
// LEAK Sensor

// TODO: Implement Status Check for Leak Detection Device

////////////////////////////////////////////////////////////////////////
// FANS MOTORS

ISYFanDevice.prototype.getCurrentFanState = function() {
    if (this.currentState === 0) {
        return "Off";
    } else if (this.currentState == ISYDefs.cmd.fanParameterLow) {
        return "Low";
    } else if (this.currentState == ISYDefs.cmd.fanParameterMedium) {
        return "Medium";
    } else if (this.currentState == ISYDefs.cmd.fanParameterHigh) {
        return "High";
    } else {
        assert(false, 'Unexpected fan state: ' + this.currentState);
    }
};

ISYFanDevice.prototype.sendFanCommand = function(fanState, resultHandler) {
    if (fanState === "Off") {
        this.isy.sendRestCommand(this.address, ISYDefs.cmd.fanOff, null, resultHandler);
    } else if (fanState == "Low") {
        this.isy.sendRestCommand(this.address, ISYDefs.cmd.fanBase, ISYDefs.cmd.fanParameterLow, resultHandler);
    } else if (fanState == "Medium") {
        this.isy.sendRestCommand(this.address, ISYDefs.cmd.fanBase, ISYDefs.cmd.fanParameterMedium, resultHandler);
    } else if (fanState == "High") {
        this.isy.sendRestCommand(this.address, ISYDefs.cmd.fanBase, ISYDefs.cmd.fanParameterHigh, resultHandler);
    } else {
        assert(false, 'Unexpected fan level: ' + fanState);
    }
};

////////////////////////////////////////////////////////////////////////
// ISYLightDevice
//

function ISYLightDevice(isy, name, address, deviceTypeInfo) {
    ISYBaseDevice.call(this, isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
    this.isDimmable = (deviceTypeInfo.deviceType == "dimmableLight");
}

util.inherits(ISYLightDevice, ISYBaseDevice);

////////////////////////////////////////////////////////////////////////
// ISYLockDevice
//

function ISYLockDevice(isy, name, address, deviceTypeInfo) {
    ISYBaseDevice.call(this, isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
}

util.inherits(ISYLockDevice, ISYBaseDevice);

ISYLockDevice.prototype.sendLockCommand = function(lockState, resultHandler) {
    if (this.deviceType == "lock") {
        this.sendNonSecureLockCommand(lockState, resultHandler);
    } else if (this.deviceType == "secureLock") {
        this.sendSecureLockCommand(lockState, resultHandler);
    } else {
        assert(false, 'Should not ever have lock which is not one of the known lock types');
    }
};

ISYLockDevice.prototype.getCurrentLockState = function() {
    if (this.deviceType == "lock") {
        return this.getCurrentNonSecureLockState();
    } else if (this.deviceType == "secureLock") {
        return this.getCurrentSecureLockState();
    } else {
        assert(false, 'Should not ever have lock which is not one of the known lock types');
    }
};

////////////////////////////////////////////////////////////////////////
// ISYDoorWindowDevice
//

function ISYDoorWindowDevice(isy, name, address, deviceTypeInfo) {
    ISYBaseDevice.call(this, isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
}

util.inherits(ISYDoorWindowDevice, ISYBaseDevice);

////////////////////////////////////////////////////////////////////////
// ISYMotionSensorDevice
//

function ISYMotionSensorDevice(isy, name, address, deviceTypeInfo) {
    ISYBaseDevice.call(this, isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
}

util.inherits(ISYMotionSensorDevice, ISYBaseDevice);


////////////////////////////////////////////////////////////////////////
// ISYLeakSensorDevice
//

function ISYLeakSensorDevice(isy, name, address, deviceTypeInfo) {
    ISYBaseDevice.call(this, isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
}

util.inherits(ISYLeakSensorDevice, ISYBaseDevice);

////////////////////////////////////////////////////////////////////////
// ISYRemoteDevice
//

function ISYRemoteDevice(isy, name, address, deviceTypeInfo) {
    ISYBaseDevice.call(this, isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
}

util.inherits(ISYRemoteDevice, ISYBaseDevice);

////////////////////////////////////////////////////////////////////////
// ISYOutletDevice
//

function ISYOutletDevice(isy, name, address, deviceTypeInfo) {
    ISYBaseDevice.call(this, isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
}

util.inherits(ISYOutletDevice, ISYBaseDevice);

////////////////////////////////////////////////////////////////////////
// ISYFanDevice
//

function ISYFanDevice(isy, name, address, deviceTypeInfo) {
    ISYBaseDevice.call(this, isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
}

util.inherits(ISYFanDevice, ISYBaseDevice);

////////////////////////////////////////////////////////////////////////
// ISYThermostatDevice
//

function ISYThermostatDevice(isy, name, address, deviceTypeInfo) {
    ISYBaseDevice.call(this, isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
}

util.inherits(ISYThermostatDevice, ISYBaseDevice);

ISYThermostatDevice.prototype.getFormattedStatus = function() {
    response = {};

    // Insteon Thermostat == Precision is 0.5deg but reported as 2x the actual value
    response.currTemp = Math.round(this.currentState / 2.0);
    if (ISYDefs.props.climate.operatingMode + "_f" in this) {
        response.currentStatus = this[ISYDefs.props.climate.operatingMode + "_f"];
    }
    if (ISYDefs.props.climate.humidity in this) {
        response.humidity = Number(this[ISYDefs.props.climate.humidity]);
    }
    if (ISYDefs.props.climate.coolSetPoint in this) {
        response.coolSetPoint = Math.round(this[ISYDefs.props.climate.coolSetPoint] / 2.0);
    }
    if (ISYDefs.props.climate.heatSetPoint in this) {
        response.heatSetPoint = Math.round(this[ISYDefs.props.climate.heatSetPoint] / 2.0);
    }
    if (ISYDefs.props.climate.fan + "_f" in this) {
        response.fanSetting = this[ISYDefs.props.climate.fan + "_f"];
    }
    if (ISYDefs.props.climate.mode + "_f" in this) {
        response.mode = this[ISYDefs.props.climate.mode + "_f"];
    }
    return response;
};

exports.ISYDefs = ISYDefs;
exports.ISYBaseDevice = ISYBaseDevice;
exports.ISYOutletDevice = ISYOutletDevice;
exports.ISYLightDevice = ISYLightDevice;
exports.ISYLockDevice = ISYLockDevice;
exports.ISYDoorWindowDevice = ISYDoorWindowDevice;
exports.ISYFanDevice = ISYFanDevice;
exports.ISYMotionSensorDevice = ISYMotionSensorDevice;
exports.ISYThermostatDevice = ISYThermostatDevice;
exports.ISYLeakSensorDevice = ISYLeakSensorDevice;
exports.ISYRemoteDevice = ISYRemoteDevice;