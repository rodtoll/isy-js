Object.defineProperty(exports, "__esModule", { value: true });
const InsteonDevice_1 = require("./InsteonDevice");
const InsteonDimmableDevice_1 = require("./InsteonDimmableDevice");
const InsteonRelayDevice_1 = require("./InsteonRelayDevice");
class InsteonKeypadDimmerDevice extends InsteonDevice_1.KeypadDevice(InsteonDimmableDevice_1.InsteonDimmableDevice) {
    constructor(isy, deviceNode) {
        super(isy, deviceNode);
    }
}
exports.InsteonKeypadDimmerDevice = InsteonKeypadDimmerDevice;
class InsteonKeypadRelayDevice extends InsteonDevice_1.KeypadDevice(InsteonRelayDevice_1.InsteonRelayDevice) {
    constructor(isy, deviceNode) {
        super(isy, deviceNode);
    }
}
exports.InsteonKeypadRelayDevice = InsteonKeypadRelayDevice;
