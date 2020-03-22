Object.defineProperty(exports, "__esModule", { value: true });
const InsteonDimmableDevice_1 = require("./InsteonDimmableDevice");
class InsteonDimmerOutletDevice extends InsteonDimmableDevice_1.InsteonDimmableDevice {
    constructor(isy, deviceNode) {
        super(isy, deviceNode);
    }
}
exports.InsteonDimmerOutletDevice = InsteonDimmerOutletDevice;
