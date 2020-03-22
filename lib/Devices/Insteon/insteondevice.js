Object.defineProperty(exports, "__esModule", { value: true });
const isyconstants_1 = require("../../isyconstants");
const utils_1 = require("../../utils");
const InsteonRelayDevice_1 = require("./InsteonRelayDevice");
exports.InsteonLampDevice = (InsteonBaseDevice) => {
    return class extends InsteonBaseDevice {
        constructor(isy, node) {
            super(isy, node);
            this.isDimmable = true;
        }
        get brightnessLevel() {
            return utils_1.byteToPct(this.status);
        }
        updateBrightnessLevel(level, resultHandler) {
            if (level !== this.brightnessLevel) {
                this.isy.sendRestCommand(this.address, isyconstants_1.Commands.On, utils_1.pctToByte(level), resultHandler);
            }
        }
    };
};
exports.InsteonSwitchDevice = (InsteonBaseDevice) => (class extends InsteonBaseDevice {
    constructor(isy, node) {
        super(isy, node);
    }
});
exports.KeypadDevice = (InsteonBaseDevice) => (class extends InsteonBaseDevice {
    constructor(isy, node) {
        super(isy, node);
    }
});
class InsteonOutletDevice extends InsteonRelayDevice_1.InsteonRelayDevice {
    constructor(isy, deviceNode) {
        super(isy, deviceNode);
    }
}
exports.InsteonOutletDevice = InsteonOutletDevice;
