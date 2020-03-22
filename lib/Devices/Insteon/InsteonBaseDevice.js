Object.defineProperty(exports, "__esModule", { value: true });
const Families_1 = require("../../Families");
const isydevice_1 = require("../../isydevice");
const utils_1 = require("../../utils");
//import { InsteonNLS } from './insteonfam'
class InsteonBaseDevice extends isydevice_1.ISYDevice {
    constructor(isy, node) {
        super(isy, node);
        this.family = Families_1.Families.Insteon;
        //this.productName = InsteonNLS.getDeviceDescription(String.fromCharCode(category,device,version));
        this.childDevices = {};
    }
    convertFrom(value, uom) {
        switch (uom) {
            case 101:
                return utils_1.byteToDegree(value);
            case 100:
                return utils_1.byteToPct(value);
            default:
                return super.convertFrom(value, uom);
        }
    }
    convertTo(value, uom) {
        const nuom = super.convertTo(value, uom);
        switch (uom) {
            case 101:
                return nuom * 2;
            case 100:
                return utils_1.pctToByte(nuom);
            default:
                return nuom;
        }
    }
    async sendBeep(level = 100) {
        return this.isy.sendNodeCommand(this, 'BEEP');
    }
}
exports.InsteonBaseDevice = InsteonBaseDevice;
