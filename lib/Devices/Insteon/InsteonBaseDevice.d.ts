import { Family } from '../../Families';
import { ISY } from '../../ISY';
import { ISYDevice } from '../ISYDevice';
export declare class InsteonBaseDevice extends ISYDevice<Family.Insteon> {
    constructor(isy: ISY, node: any);
    convertFrom(value: any, uom: number): any;
    convertTo(value: any, uom: number): any;
    sendBeep(level?: number): Promise<any>;
}
