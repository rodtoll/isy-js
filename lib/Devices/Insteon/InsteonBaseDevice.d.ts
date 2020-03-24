import { ISY } from '../../ISY';
import { ISYDevice } from '../ISYDevice';
export declare class InsteonBaseDevice extends ISYDevice {
    constructor(isy: ISY, node: {
        type: string;
    });
    convertFrom(value: any, uom: number): any;
    convertTo(value: any, uom: number): any;
    sendBeep(level?: number): Promise<any>;
}
