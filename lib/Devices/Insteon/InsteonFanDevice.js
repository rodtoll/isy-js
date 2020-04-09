Object.defineProperty(exports, "__esModule", { value: true });
const ISYConstants_1 = require("../../ISYConstants");
const ISYDevice_1 = require("../ISYDevice");
const InsteonBaseDevice_1 = require("./InsteonBaseDevice");
const InsteonDimmableDevice_1 = require("./InsteonDimmableDevice");
class InsteonFanMotorDevice extends ISYDevice_1.ISYLevelDevice(ISYDevice_1.ISYBinaryStateDevice(InsteonBaseDevice_1.InsteonBaseDevice)) {
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
            this.updateLevel(ISYConstants_1.States.Level.Min);
        }
        else {
            this.updateLevel(ISYConstants_1.States.Level.Max);
        }
    }
}
exports.InsteonFanMotorDevice = InsteonFanMotorDevice;
class InsteonFanDevice extends InsteonBaseDevice_1.InsteonBaseDevice {
    constructor(isy, deviceNode) {
        super(isy, deviceNode);
        this.Light = new InsteonDimmableDevice_1.InsteonDimmableDevice(isy, deviceNode);
        this.addChild(this.Light);
    }
    handleEvent(event) {
        const child = this.children.find(p => p.address === event.node);
        if (child !== undefined) {
            return child.handleEvent(event);
        }
        return null;
    }
    addChild(childDevice) {
        super.addChild(childDevice);
        if (childDevice instanceof InsteonFanMotorDevice) {
            this.logger('Fan Motor Found');
            this.Motor = childDevice;
        }
    }
    async updateFanSpeed(level) {
        return this.Motor.updateLevel(level);
    }
    async updateIsOn(isOn) {
        if (!isOn) {
            this.Motor.updateLevel(ISYConstants_1.States.Level.Min);
        }
        else {
            this.updateLevel(ISYConstants_1.States.Fan.High);
        }
    }
}
exports.InsteonFanDevice = InsteonFanDevice;
