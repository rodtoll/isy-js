Object.defineProperty(exports, "__esModule", { value: true });
const isydevice_1 = require("../../isydevice");
const InsteonBaseDevice_1 = require("./InsteonBaseDevice");
class InsteonCOSensorDevice extends isydevice_1.ISYBinaryStateDevice(InsteonBaseDevice_1.InsteonBaseDevice) {
    constructor(isy, deviceNode) {
        super(isy, deviceNode);
    }
    get monoxideDetected() {
        return this.state;
    }
}
exports.InsteonCOSensorDevice = InsteonCOSensorDevice;
