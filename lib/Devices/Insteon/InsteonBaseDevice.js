Object.defineProperty(exports, "__esModule", { value: true });
const Families_1 = require("../../Families");
const Utils_1 = require("../../Utils");
const ISYDevice_1 = require("../ISYDevice");
//import { InsteonNLS } from './insteonfam'
class InsteonBaseDevice extends ISYDevice_1.ISYDevice {
    constructor(isy, node) {
        super(isy, node);
        this.family = Families_1.Family.Insteon;
        //this.productName = InsteonNLS.getDeviceDescription(String.fromCharCode(category,device,version));
        this.childDevices = {};
    }
    convertFrom(value, uom) {
        switch (uom) {
            case 101:
                return Utils_1.byteToDegree(value);
            case 100:
                return Utils_1.byteToPct(value);
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
                return Utils_1.pctToByte(nuom);
            default:
                return nuom;
        }
    }
    async sendBeep(level = 100) {
        return this.isy.sendNodeCommand(this, 'BEEP');
    }
}
exports.InsteonBaseDevice = InsteonBaseDevice;
