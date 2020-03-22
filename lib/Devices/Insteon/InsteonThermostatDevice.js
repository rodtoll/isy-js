Object.defineProperty(exports, "__esModule", { value: true });
const isyconstants_1 = require("../../isyconstants");
const InsteonBaseDevice_1 = require("./InsteonBaseDevice");
class InsteonThermostatDevice extends InsteonBaseDevice_1.InsteonBaseDevice {
    constructor(isy, deviceNode) {
        super(isy, deviceNode);
    }
    get currentTemperature() {
        return this.ST;
    }
    get coolSetPoint() {
        return this[isyconstants_1.Props.Climate.CoolSetPoint];
    }
    get heatSetPoint() {
        return this[isyconstants_1.Props.Climate.HeatSetPoint];
    }
    get mode() {
        return this[isyconstants_1.Props.Climate.Mode];
    }
    get operatingMode() {
        return this[isyconstants_1.Props.Climate.OperatingMode];
    }
    get fanMode() {
        return this[isyconstants_1.Props.Climate.FanMode];
    }
    get humidity() {
        return this[isyconstants_1.Props.Climate.Humidity];
    }
    async updateCoolSetPoint(value) {
        return this.updateProperty(isyconstants_1.Props.Climate.CoolSetPoint, value);
    }
    async updateHeatSetPoint(value) {
        return this.updateProperty(isyconstants_1.Props.Climate.HeatSetPoint, value);
    }
    async updateMode(value) {
        return this.updateProperty(isyconstants_1.Props.Climate.Mode, value);
    }
}
exports.InsteonThermostatDevice = InsteonThermostatDevice;
