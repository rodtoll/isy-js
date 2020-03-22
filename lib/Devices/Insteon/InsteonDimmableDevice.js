Object.defineProperty(exports, "__esModule", { value: true });
const isydevice_1 = require("../../isydevice");
const InsteonRelayDevice_1 = require("./InsteonRelayDevice");
class InsteonDimmableDevice extends isydevice_1.ISYLevelDevice(InsteonRelayDevice_1.InsteonRelayDevice) {
    constructor(isy, node) {
        super(isy, node);
        this.isDimmable = true;
    }
    get brightnessLevel() {
        return this.level;
    }
    async updateBrightnessLevel(level) {
        return super.updateLevel(level);
    }
}
exports.InsteonDimmableDevice = InsteonDimmableDevice;
