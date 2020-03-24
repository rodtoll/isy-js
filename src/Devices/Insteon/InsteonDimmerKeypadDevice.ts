import { KeypadDevice } from './InsteonDevice';
import { InsteonDimmableDevice } from './InsteonDimmableDevice';

export class InsteonDimmerKeypadDevice extends KeypadDevice(InsteonDimmableDevice) {
	constructor (isy: any, deviceNode: any) {
		super(isy, deviceNode);
	}
}
