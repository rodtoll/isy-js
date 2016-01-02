var isy = require('./isy.js');
var util = require('util');
var assert = require('assert');

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
}

ISYBaseDevice.prototype.DIM_LEVEL_MINIMUM = 0;
ISYBaseDevice.prototype.DIM_LEVEL_MAXIMUM = 100;
ISYBaseDevice.prototype.ISY_DIM_LEVEL_MAXIMUM = 255;
ISYBaseDevice.prototype.ISY_COMMAND_LIGHT_ON = "DON";
ISYBaseDevice.prototype.ISY_COMMAND_LIGHT_OFF = "DOF";
ISYBaseDevice.prototype.ISY_COMMAND_LOCK_LOCK = "DON";
ISYBaseDevice.prototype.ISY_COMMAND_LOCK_UNLOCK = "DOF";
ISYBaseDevice.prototype.ISY_COMMAND_SECURE_LOCK_BASE = 'SECMD';
ISYBaseDevice.prototype.ISY_COMMAND_SECURE_LOCK_PARAMETER_LOCK = '1';
ISYBaseDevice.prototype.ISY_COMMAND_SECURE_LOCK_PARAMETER_UNLOCK = '0';
ISYBaseDevice.prototype.ISY_STATE_LOCK_UNLOCKED = 0;
ISYBaseDevice.prototype.ISY_STATE_DOOR_WINDOW_CLOSED = 0;
ISYBaseDevice.prototype.ISY_STATE_MOTION_SENSOR_ON = 255;
ISYBaseDevice.prototype.ISY_COMMAND_OUTLET_ON = 'DON';
ISYBaseDevice.prototype.ISY_COMMAND_OUTLET_OFF = 'DOF';
ISYBaseDevice.prototype.ISY_STATE_MOTION_SENSOR_ON = 255;
ISYBaseDevice.prototype.FAN_OFF = 'Off';
ISYBaseDevice.prototype.FAN_LEVEL_LOW = 'Low';
ISYBaseDevice.prototype.FAN_LEVEL_MEDIUM = 'Medium';
ISYBaseDevice.prototype.FAN_LEVEL_HIGH = 'High';
ISYBaseDevice.prototype.ISY_COMMAND_FAN_BASE = 'DON';
ISYBaseDevice.prototype.ISY_COMMAND_FAN_OFF = 'DOF';
ISYBaseDevice.prototype.ISY_COMMAND_FAN_PARAMETER_LOW = 63;
ISYBaseDevice.prototype.ISY_COMMAND_FAN_PARAMETER_MEDIUM = 191;
ISYBaseDevice.prototype.ISY_COMMAND_FAN_PARAMETER_HIGH = 255;

ISYBaseDevice.prototype.handleIsyUpdate = function(actionValue) {
    if(actionValue != this.currentState) {
        this.currentState = Number(actionValue);
        return true;
    } else {
        return false;
    }
}

////////////////////////////////////////////////////////////////////////
// LIGHTS

ISYBaseDevice.prototype.getCurrentLightState = function() {
    return (this.currentState > 0);
}

ISYBaseDevice.prototype.getCurrentLightDimState = function() {
    return Math.floor((this.currentState*this.DIM_LEVEL_MAXIMUM)/this.ISY_DIM_LEVEL_MAXIMUM);
}

ISYBaseDevice.prototype.sendLightCommand = function(lightState,resultHandler) {
    this.isy.sendRestCommand(this.address, (lightState) ? this.ISY_COMMAND_LIGHT_ON : this.ISY_COMMAND_LIGHT_OFF, null, resultHandler);
}

ISYBaseDevice.prototype.sendLightDimCommand = function(dimLevel,resultHandler) {
    var isyDimLevel = Math.ceil(dimLevel*this.ISY_DIM_LEVEL_MAXIMUM/this.DIM_LEVEL_MAXIMUM);
    this.isy.sendRestCommand(this.address, this.ISY_COMMAND_LIGHT_ON, isyDimLevel, resultHandler);
}

////////////////////////////////////////////////////////////////////////
// LOCKS

ISYBaseDevice.prototype.getCurrentNonSecureLockState = function() {
    return (this.currentState != this.ISY_STATE_LOCK_UNLOCKED);
}

ISYBaseDevice.prototype.getCurrentSecureLockState = function() {
    return (this.currentState > 0);
}

ISYBaseDevice.prototype.sendNonSecureLockCommand = function(lockState, resultHandler) {
    if (lockState) {
        this.isy.sendRestCommand(this.address, this.ISY_COMMAND_LOCK_LOCK, null, resultHandler);
    } else {
        this.isy.sendRestCommand(this.address, this.ISY_COMMAND_LOCK_UNLOCK, null, resultHandler);
    }
}

ISYBaseDevice.prototype.sendSecureLockCommand = function(lockState, resultHandler) {
    if(lockState) {
        this.isy.sendRestCommand(this.address, this.ISY_COMMAND_SECURE_LOCK_BASE,this.ISY_COMMAND_SECURE_LOCK_PARAMETER_LOCK,resultHandler);
    } else {
        this.isy.sendRestCommand(this.address, this.ISY_COMMAND_SECURE_LOCK_BASE,this.ISY_COMMAND_SECURE_LOCK_PARAMETER_UNLOCK,resultHandler);
    }
}

////////////////////////////////////////////////////////////////////////
// DOOR/WINDOW SENSOR

ISYBaseDevice.prototype.getCurrentDoorWindowState = function() {
    return !(this.currentState == this.ISY_STATE_DOOR_WINDOW_CLOSED);
}

////////////////////////////////////////////////////////////////////////
// OUTLETS

ISYBaseDevice.prototype.getCurrentOutletState = function() {
    return (this.currentState > 0) ? true : false;
}

ISYBaseDevice.prototype.sendOutletCommand = function(outletState,resultHandler) {
    this.isy.sendRestCommand(this.address, (outletState) ? this.ISY_COMMAND_OUTLET_ON : this.ISY_COMMAND_OUTLET_OFF, null, resultHandler);
}

////////////////////////////////////////////////////////////////////////
// MOTION SENSORS

ISYBaseDevice.prototype.getCurrentMotionSensorState = function() {
    return (this.currentState == this.ISY_STATE_MOTION_SENSOR_ON) ? true : false;
}

////////////////////////////////////////////////////////////////////////
// FANS MOTORS

ISYBaseDevice.prototype.getCurrentFanState = function() {
    if(this.currentState == 0) {
        return this.FAN_OFF;
    } else if(this.currentState == this.ISY_COMMAND_FAN_PARAMETER_LOW) {
        return this.FAN_LEVEL_LOW;
    } else if(this.currentState == this.ISY_COMMAND_FAN_PARAMETER_MEDIUM) {
        return this.FAN_LEVEL_MEDIUM;
    } else if(this.currentState == this.ISY_COMMAND_FAN_PARAMETER_HIGH) {
        return this.FAN_LEVEL_HIGH;
    } else {
        assert(false, 'Unexpected fan state: '+this.currentState);
    }
}

ISYBaseDevice.prototype.sendFanCommand = function(fanState, resultHandler) {
    if(fanState == this.FAN_OFF) {
        this.isy.sendRestCommand(this.address, this.ISY_COMMAND_FAN_OFF, null, resultHandler);
    } else if(fanState <= this.FAN_LEVEL_LOW) {
        this.isy.sendRestCommand(this.address, this.ISY_COMMAND_FAN_BASE, this.ISY_COMMAND_FAN_PARAMETER_LOW, resultHandler);
    } else if(fanState <= this.FAN_LEVEL_MEDIUM) {
        this.isy.sendRestCommand(this.address, this.ISY_COMMAND_FAN_BASE, this.ISY_COMMAND_FAN_PARAMETER_MEDIUM, resultHandler);
    } else if(fanState <= this.FAN_LEVEL_HIGH) {
        this.isy.sendRestCommand(this.address, this.ISY_COMMAND_FAN_BASE, this.ISY_COMMAND_FAN_PARAMETER_HIGH, resultHandler);
    }
}

////////////////////////////////////////////////////////////////////////
// ISYLightDevice
//

function ISYLightDevice(isy, name, address, deviceTypeInfo) {
    ISYBaseDevice.call(this, isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
}

util.inherits(ISYLightDevice,ISYBaseDevice);

////////////////////////////////////////////////////////////////////////
// ISYLockDevice
//

function ISYLockDevice(isy, name, address, deviceTypeInfo) {
    ISYBaseDevice.call(this, isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
}

util.inherits(ISYLockDevice,ISYBaseDevice);

ISYLockDevice.prototype.sendLockCommand = function(lockState, resultHandler) {
    if(this.deviceType == this.isy.DEVICE_TYPE_LOCK) {
        this.sendNonSecureLockCommand(lockState, resultHandler);
    } else if(this.deviceType == this.isy.DEVICE_TYPE_SECURE_LOCK) {
        this.sendSecureLockCommand(lockState, resultHandler);
    } else {
        assert(false, 'Should not ever have lock which is not one of the known lock types');
    }
}

ISYLockDevice.prototype.getCurrentLockState = function() {
    if(this.deviceType == this.isy.DEVICE_TYPE_LOCK) {
        return this.getCurrentNonSecureLockState();
    } else if(this.deviceType == this.isy.DEVICE_TYPE_SECURE_LOCK) {
        return this.getCurrentSecureLockState();
    } else {
        assert(false, 'Should not ever have lock which is not one of the known lock types');
    }
}

////////////////////////////////////////////////////////////////////////
// ISYDoorWindowDevice
//

function ISYDoorWindowDevice(isy, name, address, deviceTypeInfo) {
    ISYBaseDevice.call(this, isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
}

util.inherits(ISYDoorWindowDevice,ISYBaseDevice);

////////////////////////////////////////////////////////////////////////
// ISYMotionSensorDevice
//

function ISYMotionSensorDevice(isy, name, address, deviceTypeInfo) {
    ISYBaseDevice.call(this, isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
}

util.inherits(ISYMotionSensorDevice,ISYBaseDevice);

////////////////////////////////////////////////////////////////////////
// ISYOutletDevice
//

function ISYOutletDevice(isy, name, address, deviceTypeInfo) {
    ISYBaseDevice.call(this, isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
}

util.inherits(ISYOutletDevice,ISYBaseDevice);

////////////////////////////////////////////////////////////////////////
// ISYFanDevice
//

function ISYFanDevice(isy, name, address, deviceTypeInfo) {
    ISYBaseDevice.call(this, isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
}

util.inherits(ISYFanDevice,ISYBaseDevice);

exports.ISYBaseDevice = ISYBaseDevice;
exports.ISYOutletDevice = ISYOutletDevice;
exports.ISYLightDevice = ISYLightDevice;
exports.ISYLockDevice = ISYLockDevice;
exports.ISYDoorWindowDevice = ISYDoorWindowDevice;
exports.ISYFanDevice = ISYFanDevice;
exports.ISYMotionSensorDevice = ISYMotionSensorDevice;
