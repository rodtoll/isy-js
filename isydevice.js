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
    this.lastChanged = new Date();
    this.updateType = null;
    this.updatedProperty = null;
}

ISYBaseDevice.prototype.handleIsyUpdate = function(actionValue) {
    if (Number(actionValue) != this.currentState) {
        this.currentState = Number(actionValue);
        this.lastChanged = new Date();
        return true;
    } else {
        return false;
    }
};

ISYBaseDevice.prototype.handleIsyGenericPropertyUpdate = function(actionValue, prop) {
    if (Number(actionValue) != this[prop]) {
        this[prop] = Number(actionValue);
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
    return Math.floor((this.currentState * ISYDefs.props.DIM_LEVEL_MAXIMUM) / ISYDefs.props.ISY_DIM_LEVEL_MAXIMUM);
};

ISYBaseDevice.prototype.sendLightCommand = function(lightState, resultHandler) {
    this.isy.sendRestCommand(this.address, (lightState) ? ISYDefs.cmd.LIGHT_ON : ISYDefs.cmd.LIGHT_OFF, null, resultHandler);
};

ISYBaseDevice.prototype.sendLightDimCommand = function(dimLevel, resultHandler) {
    var isyDimLevel = Math.ceil(dimLevel * ISYDefs.props.ISY_DIM_LEVEL_MAXIMUM / ISYDefs.props.DIM_LEVEL_MAXIMUM);
    this.isy.sendRestCommand(this.address, ISYDefs.cmd.LIGHT_ON, isyDimLevel, resultHandler);
};

////////////////////////////////////////////////////////////////////////
// LOCKS

ISYBaseDevice.prototype.getCurrentNonSecureLockState = function() {
    return (this.currentState != ISYDefs.states.LOCK_UNLOCKED);
};

ISYBaseDevice.prototype.getCurrentSecureLockState = function() {
    return (this.currentState > 0);
};

ISYBaseDevice.prototype.sendNonSecureLockCommand = function(lockState, resultHandler) {
    if (lockState) {
        this.isy.sendRestCommand(this.address, ISYDefs.cmd.LOCK_LOCK, null, resultHandler);
    } else {
        this.isy.sendRestCommand(this.address, ISYDefs.cmd.LOCK_UNLOCK, null, resultHandler);
    }
};

ISYBaseDevice.prototype.sendSecureLockCommand = function(lockState, resultHandler) {
    if (lockState) {
        this.isy.sendRestCommand(this.address, ISYDefs.cmd.SECURE_LOCK_BASE, ISYDefs.cmd.SECURE_LOCK_PARAMETER_LOCK, resultHandler);
    } else {
        this.isy.sendRestCommand(this.address, ISYDefs.cmd.SECURE_LOCK_BASE, ISYDefs.cmd.SECURE_LOCK_PARAMETER_UNLOCK, resultHandler);
    }
};

////////////////////////////////////////////////////////////////////////
// DOOR/WINDOW SENSOR

ISYBaseDevice.prototype.getCurrentDoorWindowState = function() {
    return (this.currentState !== ISYDefs.state.DOOR_WINDOW_CLOSED);
};

////////////////////////////////////////////////////////////////////////
// OUTLETS

ISYBaseDevice.prototype.getCurrentOutletState = function() {
    return (this.currentState > 0) ? true : false;
};

ISYBaseDevice.prototype.sendOutletCommand = function(outletState, resultHandler) {
    this.isy.sendRestCommand(this.address, (outletState) ? ISYDefs.cmd.OUTLET_ON : ISYDefs.cmd.OUTLET_OFF, null, resultHandler);
};

////////////////////////////////////////////////////////////////////////
// MOTION SENSORS

ISYBaseDevice.prototype.getCurrentMotionSensorState = function() {
    return (this.currentState === ISYDefs.state.MOTION_SENSOR_ON) ? true : false;
};

////////////////////////////////////////////////////////////////////////
// LEAK Sensor

// TODO: Implement Status Check for Leak Detection Device

////////////////////////////////////////////////////////////////////////
// FANS MOTORS

ISYBaseDevice.prototype.getCurrentFanState = function() {
    if (this.currentState === 0) {
        return ISYDefs.props.fan.OFF;
    } else if (this.currentState == ISYDefs.cmd.FAN_PARAMETER_LOW) {
        return ISYDefs.props.fan.LOW;
    } else if (this.currentState == ISYDefs.cmd.FAN_PARAMETER_MEDIUM) {
        return ISYDefs.props.fan.MEDIUM;
    } else if (this.currentState == ISYDefs.cmd.FAN_PARAMETER_HIGH) {
        return ISYDefs.props.fan.HIGH;
    } else {
        assert(false, 'Unexpected fan state: ' + this.currentState);
    }
};

ISYBaseDevice.prototype.sendFanCommand = function(fanState, resultHandler) {
    if (fanState == this.FAN_OFF) {
        this.isy.sendRestCommand(this.address, ISYDefs.cmd.FAN_OFF, null, resultHandler);
    } else if (fanState == this.FAN_LEVEL_LOW) {
        this.isy.sendRestCommand(this.address, ISYDefs.cmd.FAN_BASE, ISYDefs.cmd.FAN_PARAMETER_LOW, resultHandler);
    } else if (fanState == this.FAN_LEVEL_MEDIUM) {
        this.isy.sendRestCommand(this.address, ISYDefs.cmd.FAN_BASE, ISYDefs.cmd.FAN_PARAMETER_MEDIUM, resultHandler);
    } else if (fanState == this.FAN_LEVEL_HIGH) {
        this.isy.sendRestCommand(this.address, ISYDefs.cmd.FAN_BASE, ISYDefs.cmd.FAN_PARAMETER_HIGH, resultHandler);
    } else {
        assert(false, 'Unexpected fan level: ' + fanState);
    }
};

////////////////////////////////////////////////////////////////////////
// ISYLightDevice
//

function ISYLightDevice(isy, name, address, deviceTypeInfo) {
    ISYBaseDevice.call(this, isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
    this.isDimmable = (deviceTypeInfo.deviceType == isy.DEVICE_TYPE_DIMMABLE_LIGHT);
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
    if (this.deviceType == this.isy.DEVICE_TYPE_LOCK) {
        this.sendNonSecureLockCommand(lockState, resultHandler);
    } else if (this.deviceType == this.isy.DEVICE_TYPE_SECURE_LOCK) {
        this.sendSecureLockCommand(lockState, resultHandler);
    } else {
        assert(false, 'Should not ever have lock which is not one of the known lock types');
    }
};

ISYLockDevice.prototype.getCurrentLockState = function() {
    if (this.deviceType == this.isy.DEVICE_TYPE_LOCK) {
        return this.getCurrentNonSecureLockState();
    } else if (this.deviceType == this.isy.DEVICE_TYPE_SECURE_LOCK) {
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

util.inherits(ISYLeakSensorDevice,ISYBaseDevice);

////////////////////////////////////////////////////////////////////////
// ISYRemoteDevice
//

function ISYRemoteDevice(isy, name, address, deviceTypeInfo) {
    ISYBaseDevice.call(this, isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
}

util.inherits(ISYRemoteDevice,ISYBaseDevice);

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

util.inherits(ISYThermostatDevice,ISYBaseDevice);

ISYThermostatDevice.prototype.getFormattedStatus = function() {
    response = {};
    response.currTemp = Math.round(this.currentState / 2.0);
    if (ISYDefs.props.climate.OPERATING_MODE in this) {
        switch (Number(this[ISYDefs.props.climate.OPERATING_MODE])) {
            case 0:
                response.currentStatus = 'off';
                break;
            case 1:
                response.currentStatus = 'heating';
                break;
            case 2:
                response.currentStatus = 'cooling';
                break;
            default:
                response.currentStatus = this[ISYDefs.props.climate.OPERATING_MODE];
        }
    }
    if (ISYDefs.props.climate.HUMIDITY in this) {
        response.humidity = Number(this[ISYDefs.props.climate.HUMIDITY]);
    }
    if (ISYDefs.props.climate.COOL_SET_POINT in this) {
        response.coolSetPoint = Math.round(this[ISYDefs.props.climate.COOL_SET_POINT] / 2.0);
    }
    if (ISYDefs.props.climate.HEAT_SET_POINT in this) {
        response.heatSetPoint = Math.round(this[ISYDefs.props.climate.HEAT_SET_POINT] / 2.0);
    }
    if (ISYDefs.props.climate.FAN in this) {
        switch (Number(this[ISYDefs.props.climate.FAN])) {
            case 7:
                response.fanSetting = "on";
                break;
            case 8:
                response.fanSetting = "auto";
                break;
            default:
                response.fanSetting = this[ISYDefs.props.climate.FAN];
        }
    }
    if (ISYDefs.props.climate.MODE in this) {
        switch (Number(this[ISYDefs.props.climate.MODE])) {
            case 0:
                response.mode = 'off';
                break;
            case 1:
                response.mode = 'heat';
                break;
            case 2:
                response.mode = 'cool';
                break;
            case 3:
                response.mode = 'auto';
                break;
            case 4:
                response.mode = 'fan';
                break;
            case 5:
                response.mode = 'program auto';
                break;
            case 6:
                response.mode = 'program heat';
                break;
            case 7:
                response.mode = 'program cool';
                break;
            default:
                response.mode = this.CLIMD;
        }
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