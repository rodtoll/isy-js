Object.defineProperty(exports, "__esModule", { value: true });
const isyconstants_1 = require("../../isyconstants");
const isydevice_1 = require("../../isydevice");
const InsteonBaseDevice_1 = require("./InsteonBaseDevice");
const InsteonDimmableDevice_1 = require("./InsteonDimmableDevice");
class InsteonFanMotorDevice extends isydevice_1.ISYLevelDevice(isydevice_1.ISYBinaryStateDevice(InsteonBaseDevice_1.InsteonBaseDevice)) {
    constructor(isy, deviceNode) {
        super(isy, deviceNode);
        this.hidden = true;
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
exports.InsteonFanMotorDevice = InsteonFanMotorDevice;
class InsteonFanDevice extends isydevice_1.ISYDevice {
    constructor(isy, deviceNode) {
        super(isy, deviceNode);
        this.Light = new InsteonDimmableDevice_1.InsteonDimmableDevice(isy, deviceNode);
        this.addChild(this.Light);
    }
    handleEvent(event) {
        const child = this.children.find(p => p.address === event.node);
        if (child != null) {
            return child.handleEvent(event);
        }
        return null;
    }
    addChild(childDevice) {
        super.addChild(childDevice);
        if (childDevice instanceof InsteonFanMotorDevice) {
            this.Motor = childDevice;
        }
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
