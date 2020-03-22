import { KeypadDevice } from './insteondevice';
import { InsteonDimmableDevice } from './InsteonDimmableDevice';

export class InsteonDimmerKeypadDevice extends KeypadDevice(InsteonDimmableDevice) {
	constructor (isy: any, deviceNode: any) {
		super(isy, deviceNode);
	}
}
