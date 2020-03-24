import { ISY } from '../../ISY';
import { InsteonBaseDevice } from './InsteonBaseDevice';
export declare class InsteonMotionSensorDevice extends InsteonBaseDevice {
    constructor(isy: ISY, deviceNode: {
        type: string;
    });
    handleEvent(event: {
        control: string;
    }): boolean;
    get isMotionDetected(): any;
}
