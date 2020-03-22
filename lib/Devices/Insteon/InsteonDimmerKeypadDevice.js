Object.defineProperty(exports, "__esModule", { value: true });
const insteondevice_1 = require("./insteondevice");
const InsteonDimmableDevice_1 = require("./InsteonDimmableDevice");
class InsteonDimmerKeypadDevice extends insteondevice_1.KeypadDevice(InsteonDimmableDevice_1.InsteonDimmableDevice) {
    constructor(isy, deviceNode) {
        super(isy, deviceNode);
    }
}
exports.InsteonDimmerKeypadDevice = InsteonDimmerKeypadDevice;
