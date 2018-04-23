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
    this.lastChanged = new Date();
    this.updateType = null;
    this.updatedProperty = null;
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
ISYBaseDevice.prototype.ISY_STATE_LEAK_SENSOR_DRY = "Dry";
ISYBaseDevice.prototype.ISY_STATE_LEAK_SENSOR_WET = "Wet";
ISYBaseDevice.prototype.ISY_STATE_LEAK_SENSOR_HB = "Heartbeat";
ISYBaseDevice.prototype.FAN_OFF = 'Off';
ISYBaseDevice.prototype.FAN_LEVEL_LOW = 'Low';
ISYBaseDevice.prototype.FAN_LEVEL_MEDIUM = 'Medium';
ISYBaseDevice.prototype.FAN_LEVEL_HIGH = 'High';
ISYBaseDevice.prototype.ISY_COMMAND_FAN_BASE = 'DON';
ISYBaseDevice.prototype.ISY_COMMAND_FAN_OFF = 'DOF';
ISYBaseDevice.prototype.ISY_COMMAND_FAN_PARAMETER_LOW = 63;
ISYBaseDevice.prototype.ISY_COMMAND_FAN_PARAMETER_MEDIUM = 191;
ISYBaseDevice.prototype.ISY_COMMAND_FAN_PARAMETER_HIGH = 255;

ISYBaseDevice.prototype.ISY_PROPERTY_ZWAVE_LOCK_ALARM = 'ALARM';
ISYBaseDevice.prototype.ISY_PROPERTY_ZWAVE_LOCK_ACCESS = 'USRNUM';
ISYBaseDevice.prototype.ISY_PROPERTY_ZWAVE_LOCK_STATUS = 'ST';

ISYBaseDevice.prototype.ISY_PROPERTY_ZWAVE_ENERGY_POWER_FACTOR = 'PF';
ISYBaseDevice.prototype.ISY_PROPERTY_ZWAVE_ENERGY_POWER_POLARIZED_POWER = 'PPW';
ISYBaseDevice.prototype.ISY_PROPERTY_ZWAVE_ENERGY_POWER_CURRENT = 'CC';
ISYBaseDevice.prototype.ISY_PROPERTY_ZWAVE_ENERGY_POWER_TOTAL_POWER = 'TPW';
ISYBaseDevice.prototype.ISY_PROPERTY_ZWAVE_ENERGY_POWER_VOLTAGE = 'CV';

ISYBaseDevice.prototype.ISY_PROPERTY_CLIMATE_TEMPERATURE = 'CLITEMP';
ISYBaseDevice.prototype.ISY_PROPERTY_CLIMATE_HUMIDITY = 'CLIHUM';
ISYBaseDevice.prototype.ISY_PROPERTY_CLIMATE_OPERATING_MODE = 'CLIHCS';
ISYBaseDevice.prototype.ISY_PROPERTY_CLIMATE_MODE = 'CLIMD';
ISYBaseDevice.prototype.ISY_PROPERTY_CLIMATE_FAN = 'CLIFS';
ISYBaseDevice.prototype.ISY_PROPERTY_CLIMATE_COOL_SET_POINT = 'CLISPC';
ISYBaseDevice.prototype.ISY_PROPERTY_CLIMATE_HEAT_SET_POINT = 'CLISPH';
ISYBaseDevice.prototype.ISY_PROPERTY_BATTERY_LEVEL = 'BATLVL';

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
    return Math.floor((this.currentState * this.DIM_LEVEL_MAXIMUM) / this.ISY_DIM_LEVEL_MAXIMUM);
};

ISYBaseDevice.prototype.sendLightCommand = function(lightState, resultHandler) {
    this.isy.sendRestCommand(this.address, (lightState) ? this.ISY_COMMAND_LIGHT_ON : this.ISY_COMMAND_LIGHT_OFF, null, resultHandler);
};

ISYBaseDevice.prototype.sendLightDimCommand = function(dimLevel, resultHandler) {
    var isyDimLevel = Math.ceil(dimLevel * this.ISY_DIM_LEVEL_MAXIMUM / this.DIM_LEVEL_MAXIMUM);
    this.isy.sendRestCommand(this.address, this.ISY_COMMAND_LIGHT_ON, isyDimLevel, resultHandler);
};

////////////////////////////////////////////////////////////////////////
// LOCKS

ISYBaseDevice.prototype.getCurrentNonSecureLockState = function() {
    return (this.currentState != this.ISY_STATE_LOCK_UNLOCKED);
};

ISYBaseDevice.prototype.getCurrentSecureLockState = function() {
    return (this.currentState > 0);
};

ISYBaseDevice.prototype.sendNonSecureLockCommand = function(lockState, resultHandler) {
    if (lockState) {
        this.isy.sendRestCommand(this.address, this.ISY_COMMAND_LOCK_LOCK, null, resultHandler);
    } else {
        this.isy.sendRestCommand(this.address, this.ISY_COMMAND_LOCK_UNLOCK, null, resultHandler);
    }
};

ISYBaseDevice.prototype.sendSecureLockCommand = function(lockState, resultHandler) {
    if (lockState) {
        this.isy.sendRestCommand(this.address, this.ISY_COMMAND_SECURE_LOCK_BASE, this.ISY_COMMAND_SECURE_LOCK_PARAMETER_LOCK, resultHandler);
    } else {
        this.isy.sendRestCommand(this.address, this.ISY_COMMAND_SECURE_LOCK_BASE, this.ISY_COMMAND_SECURE_LOCK_PARAMETER_UNLOCK, resultHandler);
    }
};

////////////////////////////////////////////////////////////////////////
// DOOR/WINDOW SENSOR

ISYBaseDevice.prototype.getCurrentDoorWindowState = function() {
    return (this.currentState !== this.ISY_STATE_DOOR_WINDOW_CLOSED);
};

////////////////////////////////////////////////////////////////////////
// OUTLETS

ISYBaseDevice.prototype.getCurrentOutletState = function() {
    return (this.currentState > 0) ? true : false;
};

ISYBaseDevice.prototype.sendOutletCommand = function(outletState, resultHandler) {
    this.isy.sendRestCommand(this.address, (outletState) ? this.ISY_COMMAND_OUTLET_ON : this.ISY_COMMAND_OUTLET_OFF, null, resultHandler);
};

////////////////////////////////////////////////////////////////////////
// MOTION SENSORS

ISYBaseDevice.prototype.getCurrentMotionSensorState = function() {
    return (this.currentState === this.ISY_STATE_MOTION_SENSOR_ON) ? true : false;
};

////////////////////////////////////////////////////////////////////////
// LEAK Sensor

// TODO: Implement Status Check for Leak Detection Device

////////////////////////////////////////////////////////////////////////
// FANS MOTORS

ISYBaseDevice.prototype.getCurrentFanState = function() {
    if (this.currentState === 0) {
        return this.FAN_OFF;
    } else if (this.currentState == this.ISY_COMMAND_FAN_PARAMETER_LOW) {
        return this.FAN_LEVEL_LOW;
    } else if (this.currentState == this.ISY_COMMAND_FAN_PARAMETER_MEDIUM) {
        return this.FAN_LEVEL_MEDIUM;
    } else if (this.currentState == this.ISY_COMMAND_FAN_PARAMETER_HIGH) {
        return this.FAN_LEVEL_HIGH;
    } else {
        assert(false, 'Unexpected fan state: ' + this.currentState);
    }
};

ISYBaseDevice.prototype.sendFanCommand = function(fanState, resultHandler) {
    if (fanState == this.FAN_OFF) {
        this.isy.sendRestCommand(this.address, this.ISY_COMMAND_FAN_OFF, null, resultHandler);
    } else if (fanState == this.FAN_LEVEL_LOW) {
        this.isy.sendRestCommand(this.address, this.ISY_COMMAND_FAN_BASE, this.ISY_COMMAND_FAN_PARAMETER_LOW, resultHandler);
    } else if (fanState == this.FAN_LEVEL_MEDIUM) {
        this.isy.sendRestCommand(this.address, this.ISY_COMMAND_FAN_BASE, this.ISY_COMMAND_FAN_PARAMETER_MEDIUM, resultHandler);
    } else if (fanState == this.FAN_LEVEL_HIGH) {
        this.isy.sendRestCommand(this.address, this.ISY_COMMAND_FAN_BASE, this.ISY_COMMAND_FAN_PARAMETER_HIGH, resultHandler);
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

function ISYThermostatDevice(isy, name, address, deviceTypeInfo, status) {
    ISYBaseDevice.call(this, isy, name, address, deviceTypeInfo.type, deviceTypeInfo.deviceType, deviceTypeInfo.connectionType);
    for (var i = 0; i < status.length; i++) {
        if (status[i].id === 'ST') {
            this.currentValue = status[i].value;
        } else {
            this[status[i].id] = status[i].value;
        }
    }
}

util.inherits(ISYThermostatDevice,ISYBaseDevice);

ISYThermostatDevice.prototype.getFormattedStatus = function() {
    response = {};
    response.currTemp = Math.round(this.currentState / 2.0);
    if ('CLIHCS' in this) {
        switch (this.CLIHCS) {
            case 0:
            case '0':
                response.currentStatus = 'off';
                break;
            case 1:
            case '1':
                response.currentStatus = 'heating';
                break;
            case 2:
            case '2':
                response.currentStatus = 'cooling';
                break;
            default:
                response.currentStatus = this.CLIHCS;
        }
    }
    if ('CLIHUM' in this) {
        response.humidity = Number(this.CLIHUM);
    }
    if ('CLISPC' in this) {
        response.coolSetPoint = Math.round(this.CLISPC / 2.0);
    }
    if ('CLISPH' in this) {
        response.heatSetPoint = Math.round(this.CLISPH / 2.0);
    }
    if ('CLIFS' in this) {
        if (this.CLIFS === '7') {
            response.fanSetting = 'on';
        } else if (this.CLIFS === '8') {
            response.fanSetting = 'auto';
        } else { response.fanSetting = this.CLIFS; }
    }
    if ('CLIMD' in this) {
        switch (this.CLIMD) {
            case '0':
                response.mode = 'off';
                break;
            case '1':
                response.mode = 'heat';
                break;
            case '2':
                response.mode = 'cool';
                break;
            case '3':
                response.mode = 'auto';
                break;
            case '4':
                response.mode = 'fan';
                break;
            case '5':
                response.mode = 'program auto';
                break;
            case '6':
                response.mode = 'program heat';
                break;
            case '7':
                response.mode = 'program cool';
                break;
            default:
                response.mode = this.CLIMD;
        }
    }
    return response;
};

ISYThermostatDevice.prototype.getFormattedTemp = function(prop) {
    if (prop in this && typeof this[prop] === 'number') {
        return (Math.round(this[prop] / 2.0));
    } else {
        return 0;
    }
};

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