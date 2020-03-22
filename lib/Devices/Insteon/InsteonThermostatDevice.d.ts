import { ISY } from '../../isy';
import { InsteonBaseDevice } from './InsteonBaseDevice';
export declare class InsteonThermostatDevice extends InsteonBaseDevice {
    constructor(isy: ISY, deviceNode: {
        type: string;
    });
    get currentTemperature(): any;
    get coolSetPoint(): any;
    get heatSetPoint(): any;
    get mode(): any;
    get operatingMode(): any;
    get fanMode(): any;
    get humidity(): any;
    updateCoolSetPoint(value: string): Promise<any>;
    updateHeatSetPoint(value: string): Promise<any>;
    updateMode(value: string): Promise<any>;
}
