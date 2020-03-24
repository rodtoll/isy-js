Object.defineProperty(exports, "__esModule", { value: true });
const InsteonDevice_1 = require("./InsteonDevice");
const InsteonRelayDevice_1 = require("./InsteonRelayDevice");
class InsteonRelaySwitchDevice extends InsteonDevice_1.InsteonSwitchDevice(InsteonRelayDevice_1.InsteonRelayDevice) {
    constructor(isy, deviceNode) {
        super(isy, deviceNode);
    }
}
exports.InsteonRelaySwitchDevice = InsteonRelaySwitchDevice;
