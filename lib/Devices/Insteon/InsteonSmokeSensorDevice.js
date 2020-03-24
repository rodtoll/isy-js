Object.defineProperty(exports, "__esModule", { value: true });
const ISYDevice_1 = require("../ISYDevice");
const InsteonBaseDevice_1 = require("./InsteonBaseDevice");
class InsteonSmokeSensorDevice extends ISYDevice_1.ISYBinaryStateDevice(InsteonBaseDevice_1.InsteonBaseDevice) {
    constructor(isy, deviceNode) {
        super(isy, deviceNode);
    }
    get smokeDetected() {
        return this.state;
    }
}
exports.InsteonSmokeSensorDevice = InsteonSmokeSensorDevice;
