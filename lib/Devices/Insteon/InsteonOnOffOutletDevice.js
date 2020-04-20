Object.defineProperty(exports, "__esModule", { value: true });
const InsteonRelayDevice_1 = require("./InsteonRelayDevice");
class InsteonOnOffOutletDevice extends InsteonRelayDevice_1.InsteonRelayDevice {
    constructor(isy, deviceNode) {
        super(isy, deviceNode);
        this.outlet1 = new InsteonRelayDevice_1.InsteonRelayDevice(isy, deviceNode);
        super.addChild(this.outlet1);
    }
    addChild(childDevice) {
        super.addChild(childDevice);
        this.outlet2 = childDevice;
        // if(childDevice)
    }
}
exports.InsteonOnOffOutletDevice = InsteonOnOffOutletDevice;
