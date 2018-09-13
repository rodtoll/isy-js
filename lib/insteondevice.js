'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.InsteonFanDevice = exports.InsteonOutletDevice = exports.InsteonThermostatDevice = exports.InsteonMotionSensorDevice = exports.InsteonDoorWindowSensorDevice = exports.InsteonLockDevice = exports.InsteonDimmerKeypadDevice = exports.InsteonKeypadDevice = exports.InsteonDimmerSwitchDevice = exports.InsteonDimmerOutletDevice = exports.InsteonOnOffOutletDevice = exports.InsteonRelaySwitchDevice = exports.InsteonRelayDevice = exports.InsteonSwitchDevice = exports.InsteonLampDevice = exports.InsteonDimmableDevice = exports.InsteonBaseDevice = undefined;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _isyconstants = require('./isyconstants.js');

var _isydevice = require('./isydevice.js');

var _utils = require('./utils.js');

var _https = require('https');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class InsteonBaseDevice extends _isydevice.ISYDevice {
    constructor( /*isy*/isy, node, productInfo, propertyChangeCallback) {
        super(isy, node, propertyChangeCallback);
        this.family = _isyconstants.Families.Insteon;
        this.productName = productInfo.name;
        this.deviceType = productInfo.deviceType;
        this.batteryOperated = this.deviceType == _isyconstants.DeviceTypes.motionSensor;
        this.connectionType = productInfo.connectionType;
        this.deviceFriendlyName = this.deviceType;
        this.childDevices = {};
    }

    get status() {
        return this.ST;
    }

    convertFrom(value, uom) {
        switch (Number(uom)) {
            case 101:
                return (0, _utils.byteToDegree)(value);
            case 100:
                return (0, _utils.byteToPct)(value);
            default:
                return value;
        }
    }

    convertTo(value, uom) {
        switch (Number(uom)) {
            case 101:
                return value * 2;
            case 100:
                return (0, _utils.pctToByte)(value);
            default:
                return value;

        }
    }
}

exports.InsteonBaseDevice = InsteonBaseDevice;
const InsteonDimmableDevice = exports.InsteonDimmableDevice = InsteonRelayDevice => class extends (0, _isydevice.ISYLevelDevice)(InsteonRelayDevice) {
    constructor(isy, node, productInfo) {
        super(isy, node, productInfo);
        this.isDimmable = true;
    }

    get brightnessLevel() {
        return this.level;
    }

    updateBrightnessLevel(level, resultHandler) {

        this.updateLevel(level, resultHandler);
    }
};

const InsteonLampDevice = exports.InsteonLampDevice = InsteonBaseDevice => class extends InsteonBaseDevice {
    constructor(isy, node, productInfo) {
        super(isy, node, productInfo);
        this.isDimmable = true;
    }

    get brightnessLevel() {
        return (0, _utils.byteToPct)(this.status);
    }

    updateBrightnessLevel(level, resultHandler) {

        if (level != this.brightnessLevel) {
            this.isy.sendRestCommand(this.address, _isyconstants.Commands.On, (0, _utils.pctToByte)(level), resultHandler);
        }
    }
};
const InsteonSwitchDevice = exports.InsteonSwitchDevice = InsteonBaseDevice => class extends InsteonBaseDevice {
    constructor(isy, node, productInfo) {
        super(isy, node, productInfo);
        this.isDimmable = true;
    }

    get brightnessLevel() {
        return (0, _utils.byteToPct)(this.status);
    }

    updateBrightnessLevel(level, resultHandler) {

        if (level != this.brightnessLevel) {
            this.sendCommand(_isyconstants.Commands.On, (0, _utils.pctToByte)(level), resultHandler);
        }
    }
};

class InsteonRelayDevice extends (0, _isydevice.ISYBinaryStateDevice)(InsteonBaseDevice) {
    constructor(isy, node, productInfo) {
        super(isy, node, productInfo);
    }

    get isOn() {
        return this.state;
    }

    updateIsOn(isOn, resultHandler) {
        this.updateState(isOn, resultHandler);
    }
}

exports.InsteonRelayDevice = InsteonRelayDevice;
class InsteonRelaySwitchDevice extends InsteonSwitchDevice(InsteonRelayDevice) {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
    }
}
exports.InsteonRelaySwitchDevice = InsteonRelaySwitchDevice;
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
class InsteonDimmerSwitchDevice extends InsteonDimmableDevice(InsteonSwitchDevice(InsteonRelayDevice)) {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
    }
}

exports.InsteonDimmerSwitchDevice = InsteonDimmerSwitchDevice;
class InsteonKeypadDevice extends InsteonRelayDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
    }
}

exports.InsteonKeypadDevice = InsteonKeypadDevice;
class InsteonDimmerKeypadDevice extends InsteonDimmableDevice(InsteonKeypadDevice) {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
    }
}

exports.InsteonDimmerKeypadDevice = InsteonDimmerKeypadDevice;
class InsteonLockDevice extends InsteonBaseDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
    }

    sendLockCommand(lockState, resultHandler) {
        if (this.deviceType == _isyconstants.DeviceTypes.lock) {
            this.sendNonSecureLockCommand(lockState, resultHandler);
        } else if (this.deviceType == _isyconstants.DeviceTypes.secureLock) {
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
            this.isy.sendRestCommand(this.address, _isyconstants.Commands.lock.lock, null, resultHandler);
        } else {
            this.isy.sendRestCommand(this.address, _isyconstants.Commands.lock.unlock, null, resultHandler);
        }
    }
    sendSecureLockCommand(lockState, resultHandler) {
        if (lockState) {
            this.isy.sendRestCommand(this.address, _isyconstants.Commands.On, _isyconstants.States.secureLock.secured, resultHandler);
        } else {
            this.isy.sendRestCommand(this.address, _isyconstants.Commands.On, _isyconstants.States.secureLock.notSecured, resultHandler);
        }
    }
}

exports.InsteonLockDevice = InsteonLockDevice;
class InsteonDoorWindowSensorDevice extends (0, _isydevice.ISYBinaryStateDevice)(InsteonBaseDevice) {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
    }

    get isOpen() {
        return this.state;
    }
}

exports.InsteonDoorWindowSensorDevice = InsteonDoorWindowSensorDevice;
class InsteonMotionSensorDevice extends InsteonBaseDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
        this._isMotionDetected = false;
    }

    handleEvent(event) {

        if (!super.handleEvent(event)) {
            if (event.control == _isyconstants.Commands.On) {
                this.logger("Motion detected.");
                this._isMotionDetected = true;

                this.propertyChanged.emit('', 'motionDetected', true, true);

                setTimeout(() => {
                    this.logger("No motion detected in last 30 seconds.");
                    this._isMotionDetected = false;
                    this.propertyChanged.emit('', 'motionDetected', false, false);
                }, 30000);
            } else if (event.control === _isyconstants.Commands.Off) {
                this._isMotionDetected = false;
                this.logger("No motion detected.");
                this.propertyChanged.emit('', 'motionDetected', false, false);
            }
        }
        return true;
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
        return this.ST;
    }

    get coolSetPoint() {
        return this[_isyconstants.Props.Climate.CoolSetPoint];
    }
    get heatSetPoint() {
        return this[_isyconstants.Props.Climate.HeatSetPoint];
    }
    get mode() {
        return this[_isyconstants.Props.Climate.Mode];
    }
    get operatingMode() {
        return this[_isyconstants.Props.Climate.OperatingMode];
    }
    get fanMode() {
        return this[_isyconstants.Props.Climate.FanMode];
    }
    get humidity() {
        return this[_isyconstants.Props.Climate.Humidity];
    }

    updateCoolSetPoint(value, resultHandler) {
        this.updateProperty(_isyconstants.Props.Climate.CoolSetPoint, value, resultHandler);
    }

    updateHeatSetPoint(value, resultHandler) {

        this.updateProperty(_isyconstants.Props.Climate.HeatSetPoint, value, resultHandler);
    }

    updateMode(value, resultHandler) {
        this.updateProperty(_isyconstants.Props.Climate.Mode, value, resultHandler);
    }
}

exports.InsteonThermostatDevice = InsteonThermostatDevice;
class InsteonOutletDevice extends InsteonRelayDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
    }
}

exports.InsteonOutletDevice = InsteonOutletDevice;
class InsteonFanDevice extends (0, _isydevice.ISYLevelDevice)((0, _isydevice.ISYBinaryStateDevice)(InsteonBaseDevice)) {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
    }

    get isOn() {
        return this.state;
    }

    get fanSpeed() {
        return this.level;
    }

    updateFanSpeed(level, resultHandler) {
        this.updateLevel(level, resultHandler);
    }

    updateIsOn(isOn, resultHandler) {
        this.updateLevel(_isyconstants.States.DimLevel.Max, resultHandler);
    }

}
exports.InsteonFanDevice = InsteonFanDevice;