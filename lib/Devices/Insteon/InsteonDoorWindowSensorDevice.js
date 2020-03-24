Object.defineProperty(exports, "__esModule", { value: true });
const ISYDevice_1 = require("../ISYDevice");
const InsteonBaseDevice_1 = require("./InsteonBaseDevice");
class InsteonDoorWindowSensorDevice extends ISYDevice_1.ISYBinaryStateDevice(InsteonBaseDevice_1.InsteonBaseDevice) {
    constructor(isy, deviceNode) {
        super(isy, deviceNode);
    }
    get isOpen() {
        return this.state;
    }
}
exports.InsteonDoorWindowSensorDevice = InsteonDoorWindowSensorDevice;
