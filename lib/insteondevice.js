'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.InsteonFanDevice = exports.InsteonOutletDevice = exports.InsteonThermostatDevice = exports.InsteonMotionSensorDevice = exports.InsteonDoorWindowSensorDevice = exports.InsteonLockDevice = exports.InsteonDimmerKeypadDevice = exports.InsteonKeypadDevice = exports.InsteonDimmerSwitchDevice = exports.InsteonSwitchDevice = exports.InsteonDimmerOutletDevice = exports.InsteonOnOffOutletDevice = exports.InsteonRelayDevice = exports.InsteonDimmableDevice = exports.InsteonBaseDevice = undefined;

var _isy = require('./isy.js');

var _isy2 = _interopRequireDefault(_isy);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _isyconstants = require('./isyconstants.js');

var _isydevice = require('./isydevice.js');

var _utils = require('./utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class InsteonBaseDevice extends _isydevice.ISYDevice {
    constructor( /*isy*/isy, node, productInfo, propertyChangeCallback) {
        super(isy, node, propertyChangeCallback);
        this.family = _isyconstants.Families.insteon;
        this.productName = productInfo.name;
        this.deviceType = productInfo.deviceType;
        this.batteryOperated = this.deviceType == _isyconstants.DeviceTypes.motionSensor;
        this.connectionType = productInfo.connectionType;
        this._deviceFriendlyName = this.deviceType;
        this.childDevices = {};
    }

    get status() {
        return this.ST;
    }

    get deviceFriendlyName() {
        return this._deviceFriendlyName;
    }

}

exports.InsteonBaseDevice = InsteonBaseDevice;
const InsteonDimmableDevice = exports.InsteonDimmableDevice = InsteonRelayDevice => class extends InsteonRelayDevice {
    constructor(isy, node, productInfo) {
        super(isy, node, productInfo);
        this.isDimmable = true;
    }

    get brightnessLevel() {
        return (0, _utils.byteToPct)(this.status);
    }

    updateBrightnessLevel(level, resultHandler) {

        if (level != this.brightnessLevel) {
            this.isy.sendRestCommand(this.address, Constants.cmd.on, (0, _utils.pctToByte)(level), resultHandler);
        }
    }
};

class InsteonRelayDevice extends InsteonBaseDevice {
    constructor(isy, node, productInfo) {
        super(isy, node, productInfo);
    }

    get isOn() {
        return this.status > 0;
    }

    updateIsOn(isOn, resultHandler) {
        if (isOn != this.isOn) {
            this.isy.sendRestCommand(this.address, isOn ? _isyconstants.Commands.on : _isyconstants.Commands.off, null, resultHandler);
        }
    }
}

exports.InsteonRelayDevice = InsteonRelayDevice;
class InsteonOnOffOutletDevice extends InsteonRelayDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
    }
}

exports.InsteonOnOffOutletDevice = InsteonOnOffOutletDevice;
class InsteonDimmerOutletDevice extends InsteonDimmableDevice(InsteonRelayDevice) {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
    }

}

exports.InsteonDimmerOutletDevice = InsteonDimmerOutletDevice;
class InsteonSwitchDevice extends InsteonRelayDevice {}

exports.InsteonSwitchDevice = InsteonSwitchDevice;
class InsteonDimmerSwitchDevice extends InsteonDimmableDevice(InsteonSwitchDevice) {}

exports.InsteonDimmerSwitchDevice = InsteonDimmerSwitchDevice;
class InsteonKeypadDevice extends InsteonRelayDevice {}

exports.InsteonKeypadDevice = InsteonKeypadDevice;
class InsteonDimmerKeypadDevice extends InsteonDimmableDevice(InsteonKeypadDevice) {}

exports.InsteonDimmerKeypadDevice = InsteonDimmerKeypadDevice;
class InsteonLockDevice extends InsteonBaseDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
    }

    sendLockCommand(lockState, resultHandler) {
        if (this.deviceType == this.isy.DEVICE_TYPE_LOCK) {
            this.sendNonSecureLockCommand(lockState, resultHandler);
        } else if (this.deviceType == this.isy.DEVICE_TYPE_SECURE_LOCK) {
            this.sendSecureLockCommand(lockState, resultHandler);
        } else {
            (0, _assert2.default)(false, 'Should not ever have lock which is not one of the known lock types');
        }
    }

    get isLocked() {
        return this.getCurrentLockState();
    }

    getCurrentLockState() {
        if (this.deviceType == _isyconstants.DeviceTypes.lock) {
            return this.getCurrentNonSecureLockState();
        } else if (this.deviceType == _isyconstants.DeviceTypes.secureLock) {
            return this.getCurrentSecureLockState();
        } else {
            (0, _assert2.default)(false, 'Should not ever have lock which is not one of the known lock types');
        }
    }

    getCurrentNonSecureLockState() {
        return this.ST != _isyconstants.States.lockUnlocked;
    }

    getCurrentSecureLockState() {
        return this.ST > 0;
    }

    sendNonSecureLockCommand(lockState, resultHandler) {
        if (lockState) {
            this.isy.sendRestCommand(this.address, Constants.cmd.lock.lock, null, resultHandler);
        } else {
            this.isy.sendRestCommand(this.address, Constants.cmd.lock.unlock, null, resultHandler);
        }
    }
    sendSecureLockCommand(lockState, resultHandler) {
        if (lockState) {
            this.isy.sendRestCommand(this.address, _isyconstants.Commands.on, _isyconstants.States.secureLock.secured, resultHandler);
        } else {
            this.isy.sendRestCommand(this.address, _isyconstants.Commands.on, _isyconstants.States.secureLock.notSecured, resultHandler);
        }
    }
}

exports.InsteonLockDevice = InsteonLockDevice;
class InsteonDoorWindowSensorDevice extends InsteonBaseDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
    }

    get isOpen() {
        return this.ST != _isyconstants.States.doorWindow.open;
    }
}

exports.InsteonDoorWindowSensorDevice = InsteonDoorWindowSensorDevice;
class InsteonMotionSensorDevice extends InsteonBaseDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
        this._isMotionDetected = false;
    }

    handleIsyUpdate(actionValue, propertyName, formattedValue, subAddress) {
        if (propertyName == _isyconstants.Commands.on) {
            this._isMotionDetected = true;
            this.propertyChanged.emit('', 'motionDetected', actionValue, formattedValue);

            return true;
        } else if (propertyName == _isyconstants.Commands.off) {
            this._isMotionDetected = false;
            this.propertyChanged.emit('', 'motionDetected', actionValue, formattedValue);
        } else return super.handleIsyUpdate(actionValue, propertyName, formattedValue, subAddress);
    }

    get isMotionDetected() {
        return this._isMotionDetected;
    }
}

exports.InsteonMotionSensorDevice = InsteonMotionSensorDevice;
class InsteonThermostatDevice extends InsteonBaseDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
    }

    get currentTemperature() {
        return this.ST / 2;
    }

    get coolSetPoint() {
        return this[_isyconstants.Props.climate.coolSetPoint] / 2;
    }
    get heatSetPoint() {
        return this[_isyconstants.Props.climate.heatSetPoint] / 2;
    }
    get mode() {
        return this[_isyconstants.Props.climate.mode];
    }
    get operatingMode() {
        return this[_isyconstants.Props.climate.operatingMode];
    }
    get fanMode() {
        return this[_isyconstants.Props.climate.fanMode];
    }
    get humidity() {
        return (0, _utils.byteToPct)(this[_isyconstants.Props.climate.humidity]);
    }

    updateCoolSetPoint(value, resultHandler) {
        this.isy.sendRestCommand(this.address, _isyconstants.Props.climate.coolSetPoint, value * 2, resultHandler);
    }

    updateHeatSetPoint(value, resultHandler) {

        this.isy.sendRestCommand(this.address, _isyconstants.Props.climate.heatSetPoint, value * 2, resultHandler);
    }

    updateMode(value, resultHandler) {
        this.isy.sendRestCommand(this.address, _isyconstants.Props.climate.mode, value * 2, resultHandler);
    }
}

exports.InsteonThermostatDevice = InsteonThermostatDevice;
class InsteonOutletDevice extends InsteonRelayDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
    }

    get CurrentOutletState() {
        return this.ST > 0 ? true : false;
    }
    updateOutletState(outletState, resultHandler) {
        this.isy.sendRestCommand(this.address, outletState ? _isyconstants.Commands.on : _isyconstants.Commands.off, null, resultHandler);
    }
}

exports.InsteonOutletDevice = InsteonOutletDevice;
class InsteonFanDevice extends InsteonBaseDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
    }

    get FanState() {
        if (this.status == 0) {
            return _isyconstants.Props.fan.off;
        } else if (this.status == _isyconstants.States.fan.low) {
            return _isyconstants.Props.fan.low;
        } else if (this.status == _isyconstants.States.fan.medium) {
            return _isyconstants.Props.fan.medium;
        } else if (this.status == _isyconstants.States.fan.high) {
            return _isyconstants.Props.fan.high;
        } else {
            (0, _assert2.default)(false, `Unexpected fan state: ${this.status} (${this.formatted.ST})`);
        }
    }

    updateFanState(fanState, resultHandler) {
        if (fanState == _isyconstants.Props.fan.off) {
            this.isy.sendRestCommand(this.address, _isyconstants.Commands.fan.off, null, resultHandler);
        } else if (fanState == _isyconstants.Props.fan.low) {
            this.isy.sendRestCommand(this.address, _isyconstants.Commands.fan.on, _isyconstants.States.fan.low, resultHandler);
        } else if (fanState == _isyconstants.Props.fan.medium) {
            this.isy.sendRestCommand(this.address, _isyconstants.Commands.fan.on, _isyconstants.States.fan.medium, resultHandler);
        } else if (fanState == _isyconstants.Props.fan.high) {
            this.isy.sendRestCommand(this.address, _isyconstants.Commands.fan.on, _isyconstants.States.fan.high, resultHandler);
        } else {
            (0, _assert2.default)(false, 'Unexpected fan level: ' + fanState);
        }
    }

}
exports.InsteonFanDevice = InsteonFanDevice;