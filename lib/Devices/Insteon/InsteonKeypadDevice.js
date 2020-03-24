Object.defineProperty(exports, "__esModule", { value: true });
const InsteonDevice_1 = require("./InsteonDevice");
const InsteonRelayDevice_1 = require("./InsteonRelayDevice");
class InsteonKeypadDevice extends InsteonDevice_1.KeypadDevice(InsteonRelayDevice_1.InsteonRelayDevice) {
    constructor(isy, deviceNode) {
        super(isy, deviceNode);
    }
}
exports.InsteonKeypadDevice = InsteonKeypadDevice;
