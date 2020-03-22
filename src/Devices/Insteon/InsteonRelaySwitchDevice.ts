import { InsteonSwitchDevice } from './insteondevice';
import { InsteonRelayDevice } from './InsteonRelayDevice';

export class InsteonRelaySwitchDevice extends InsteonSwitchDevice(InsteonRelayDevice) {
	constructor (isy: any, deviceNode: any) {
		super(isy, deviceNode);
	}
}
