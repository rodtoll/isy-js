Object.defineProperty(exports, "__esModule", { value: true });
const insteondevice_1 = require("./insteondevice");
const InsteonRelayDevice_1 = require("./InsteonRelayDevice");
class InsteonRelaySwitchDevice extends insteondevice_1.InsteonSwitchDevice(InsteonRelayDevice_1.InsteonRelayDevice) {
    constructor(isy, deviceNode) {
        super(isy, deviceNode);
    }
}
exports.InsteonRelaySwitchDevice = InsteonRelaySwitchDevice;
