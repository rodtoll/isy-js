Object.defineProperty(exports, "__esModule", { value: true });
const isydevice_1 = require("../../isydevice");
const InsteonBaseDevice_1 = require("./InsteonBaseDevice");
class InsteonRelayDevice extends isydevice_1.ISYBinaryStateDevice(InsteonBaseDevice_1.InsteonBaseDevice) {
    constructor(isy, node) {
        super(isy, node);
    }
    get isOn() {
        return this.state;
    }
    async updateIsOn(isOn) {
        if (this.isOn !== isOn) {
            return super.updateState(isOn);
        }
        else {
            return Promise.resolve();
        }
    }
}
exports.InsteonRelayDevice = InsteonRelayDevice;
