Object.defineProperty(exports, "__esModule", { value: true });
const InsteonDevice_1 = require("./InsteonDevice");
const InsteonDimmableDevice_1 = require("./InsteonDimmableDevice");
class InsteonDimmerSwitchDevice extends InsteonDevice_1.InsteonSwitchDevice(InsteonDimmableDevice_1.InsteonDimmableDevice) {
    constructor(isy, deviceNode) {
        super(isy, deviceNode);
    }
}
exports.InsteonDimmerSwitchDevice = InsteonDimmerSwitchDevice;
