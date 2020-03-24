Object.defineProperty(exports, "__esModule", { value: true });
const InsteonRelayDevice_1 = require("./InsteonRelayDevice");
class InsteonOnOffOutletDevice extends InsteonRelayDevice_1.InsteonRelayDevice {
    constructor(isy, deviceNode) {
        super(isy, deviceNode);
    }
}
exports.InsteonOnOffOutletDevice = InsteonOnOffOutletDevice;
