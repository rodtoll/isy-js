"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isyconstants_1 = require("./isyconstants");
const isydevice_1 = require("./isydevice");
const utils_1 = require("./utils");
class InsteonBaseDevice extends isydevice_1.ISYDevice {
    constructor(isy, node, productInfo) {
        super(isy, node);
        this.family = isyconstants_1.Families.Insteon;
        this.productName = productInfo.name;
        this.deviceType = productInfo.deviceType;
        this.batteryOperated = this.deviceType == isyconstants_1.DeviceTypes.motionSensor;
        this.connectionType = productInfo.connectionType;
        this.deviceFriendlyName = this.deviceType;
        this.childDevices = {};
    }
    convertFrom(value, uom) {
        switch (uom) {
            case 101:
                return utils_1.byteToDegree(value);
            case 100:
                return utils_1.byteToPct(value);
            default:
                return super.convertFrom(value, uom);
        }
    }
    convertTo(value, uom) {
        let nuom = super.convertTo(value, uom);
        switch (uom) {
            case 101:
                return nuom * 2;
            case 100:
                return utils_1.pctToByte(nuom);
            default:
                return nuom;
        }
    }
    async sendBeep(level = 100) {
        return this.isy.sendNodeCommand(this, 'BEEP');
    }
}
exports.InsteonBaseDevice = InsteonBaseDevice;
exports.InsteonLampDevice = InsteonBaseDevice => class extends InsteonBaseDevice {
    constructor(isy, node, productInfo) {
        super(isy, node, productInfo);
        this.isDimmable = true;
    }
    get brightnessLevel() {
        return utils_1.byteToPct(this.status);
    }
    updateBrightnessLevel(level, resultHandler) {
        if (level != this.brightnessLevel) {
            this.isy.sendRestCommand(this.address, isyconstants_1.Commands.On, utils_1.pctToByte(level), resultHandler);
        }
    }
};
exports.InsteonSwitchDevice = InsteonBaseDevice => class extends InsteonBaseDevice {
    constructor(isy, node, productInfo) {
        super(isy, node, productInfo);
        this.isDimmable = true;
    }
    get brightnessLevel() {
        return utils_1.byteToPct(this.status);
    }
    updateBrightnessLevel(level, resultHandler) {
        if (level != this.brightnessLevel) {
            this.sendCommand(isyconstants_1.Commands.On, utils_1.pctToByte(level), resultHandler);
        }
    }
};
class InsteonRelayDevice extends isydevice_1.ISYBinaryStateDevice(InsteonBaseDevice) {
    constructor(isy, node, productInfo) {
        super(isy, node, productInfo);
    }
    get isOn() {
        return this.state;
    }
    async updateIsOn(isOn) {
        return super.updateState(isOn);
    }
}
exports.InsteonRelayDevice = InsteonRelayDevice;
class InsteonDimmableDevice extends isydevice_1.ISYLevelDevice(InsteonRelayDevice) {
    constructor(isy, node, productInfo) {
        super(isy, node, productInfo);
        this.isDimmable = true;
    }
    get brightnessLevel() {
        return this.level;
    }
    async updateBrightnessLevel(level) {
        return super.updateLevel(level);
    }
}
exports.InsteonDimmableDevice = InsteonDimmableDevice;
class InsteonRelaySwitchDevice extends exports.InsteonSwitchDevice(InsteonRelayDevice) {
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
class InsteonDimmerOutletDevice extends InsteonDimmableDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
    }
}
exports.InsteonDimmerOutletDevice = InsteonDimmerOutletDevice;
class InsteonDimmerSwitchDevice extends InsteonDimmableDevice {
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
class InsteonDimmerKeypadDevice extends InsteonDimmableDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
    }
}
exports.InsteonDimmerKeypadDevice = InsteonDimmerKeypadDevice;
class InsteonLockDevice extends isydevice_1.ISYBinaryStateDevice(InsteonBaseDevice) {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
    }
    sendLockCommand(lockState, resultHandler) {
        if (this.deviceType == isyconstants_1.DeviceTypes.lock) {
            this.sendNonSecureLockCommand(lockState);
        }
        else if (this.deviceType == isyconstants_1.DeviceTypes.secureLock) {
            this.sendSecureLockCommand(lockState);
        }
        else {
            //assert(false, 'Should not ever have lock which is not one of the known lock types');
        }
    }
    get isLocked() {
        return this.state;
    }
    getCurrentLockState() {
        if (this.deviceType == isyconstants_1.DeviceTypes.lock) {
            return this.getCurrentNonSecureLockState();
        }
        else if (this.deviceType == isyconstants_1.DeviceTypes.secureLock) {
            return this.getCurrentSecureLockState();
        }
        else {
            //assert(false, 'Should not ever have lock which is not one of the known lock types');
        }
    }
    getCurrentNonSecureLockState() {
        return this.ST != isyconstants_1.States.Lock.Locked;
    }
    getCurrentSecureLockState() {
        return this.ST > 0;
    }
    async sendNonSecureLockCommand(lockState) {
        if (lockState) {
            return this.isy.sendNodeCommand(this, isyconstants_1.Commands.Lock.Lock);
        }
        else {
            return this.isy.sendNodeCommand(this, isyconstants_1.Commands.Lock.Unlock);
        }
    }
    async sendSecureLockCommand(lockState) {
        if (lockState) {
            return this.isy.sendNodeCommand(this, isyconstants_1.Commands.On, isyconstants_1.States.SecureLock.Secured);
        }
        else {
            return this.isy.sendNodeCommand(this, isyconstants_1.Commands.On, isyconstants_1.States.SecureLock.NotSecured);
        }
    }
}
exports.InsteonLockDevice = InsteonLockDevice;
class InsteonDoorWindowSensorDevice extends isydevice_1.ISYBinaryStateDevice(InsteonBaseDevice) {
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
            if (event.control == isyconstants_1.Commands.On) {
                this.logger('Motion detected.');
                this._isMotionDetected = true;
                this.propertyChanged.emit('', 'motionDetected', true, true);
                setTimeout(() => {
                    this.logger('No motion detected in last 30 seconds.');
                    this._isMotionDetected = false;
                    this.propertyChanged.emit('', 'motionDetected', false, false);
                }, 30000);
            }
            else if (event.control === isyconstants_1.Commands.Off) {
                this._isMotionDetected = false;
                this.logger('No motion detected.');
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
        return this[isyconstants_1.Props.Climate.CoolSetPoint];
    }
    get heatSetPoint() {
        return this[isyconstants_1.Props.Climate.HeatSetPoint];
    }
    get mode() {
        return this[isyconstants_1.Props.Climate.Mode];
    }
    get operatingMode() {
        return this[isyconstants_1.Props.Climate.OperatingMode];
    }
    get fanMode() {
        return this[isyconstants_1.Props.Climate.FanMode];
    }
    get humidity() {
        return this[isyconstants_1.Props.Climate.Humidity];
    }
    async updateCoolSetPoint(value) {
        return this.updateProperty(isyconstants_1.Props.Climate.CoolSetPoint, value);
    }
    async updateHeatSetPoint(value) {
        return this.updateProperty(isyconstants_1.Props.Climate.HeatSetPoint, value);
    }
    async updateMode(value) {
        return this.updateProperty(isyconstants_1.Props.Climate.Mode, value);
    }
}
exports.InsteonThermostatDevice = InsteonThermostatDevice;
class InsteonOutletDevice extends InsteonRelayDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
    }
}
exports.InsteonOutletDevice = InsteonOutletDevice;
class InsteonFanDevice extends isydevice_1.ISYLevelDevice(isydevice_1.ISYBinaryStateDevice(InsteonBaseDevice)) {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode, productInfo);
    }
    get isOn() {
        return this.state;
    }
    get fanSpeed() {
        return this.level;
    }
    async updateFanSpeed(level) {
        return this.updateLevel(level);
    }
    async updateIsOn(isOn) {
        if (!isOn) {
            this.updateLevel(isyconstants_1.States.Level.Min);
        }
        else {
            this.updateLevel(isyconstants_1.States.Level.Max);
        }
    }
}
exports.InsteonFanDevice = InsteonFanDevice;
