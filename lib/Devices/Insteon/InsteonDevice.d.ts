import { ISY, Family, ISYDevice } from '../../ISY';
import { InsteonRelayDevice } from './InsteonRelayDevice';
export declare const InsteonLampDevice: (InsteonBaseDevice: any) => {
    new (isy: any, node: any): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare const InsteonSwitchDevice: (InsteonBaseDevice: any) => {
    new (isy: any, node: any): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare const KeypadDevice: (IB: any) => {
    new (isy: any, node: any): {
        [x: string]: any;
        addChild(childDevice: ISYDevice<Family.Insteon>): void;
    };
    [x: string]: any;
};
export declare class InsteonOutletDevice extends InsteonRelayDevice {
    constructor(isy: ISY, deviceNode: any);
}
