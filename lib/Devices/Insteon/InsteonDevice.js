Object.defineProperty(exports, "__esModule", { value: true });
const InsteonRelayDevice_1 = require("./InsteonRelayDevice");
exports.InsteonLampDevice = (InsteonBaseDevice) => {
    return class extends InsteonBaseDevice {
        constructor(isy, node) {
            super(isy, node);
            this.isDimmable = true;
        }
    };
};
exports.InsteonSwitchDevice = (InsteonBaseDevice) => (class extends InsteonBaseDevice {
    constructor(isy, node) {
        super(isy, node);
    }
});
exports.KeypadDevice = (IB) => (class extends IB {
    constructor(isy, node) {
        super(isy, node);
    }
    addChild(childDevice) {
        super.addChild(childDevice);
    }
});
class InsteonOutletDevice extends InsteonRelayDevice_1.InsteonRelayDevice {
    constructor(isy, deviceNode) {
        super(isy, deviceNode);
    }
}
exports.InsteonOutletDevice = InsteonOutletDevice;
