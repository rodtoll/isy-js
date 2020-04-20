import { ISY, ISYDevice, Family } from '../../ISY';
import { InsteonRelayDevice } from './InsteonRelayDevice';
export declare class InsteonOnOffOutletDevice extends InsteonRelayDevice {
    outlet1: InsteonRelayDevice;
    outlet2: InsteonRelayDevice;
    constructor(isy: ISY, deviceNode: any);
    addChild(childDevice: ISYDevice<Family.Insteon>): void;
}
