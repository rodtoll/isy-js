import { ISY } from '../../isy';
import { KeypadDevice } from './insteondevice';
import { InsteonRelayDevice } from './InsteonRelayDevice';

export class InsteonKeypadDevice extends KeypadDevice(InsteonRelayDevice) {
	constructor (isy: ISY, deviceNode: any) {
		super(isy, deviceNode);
	}
}
