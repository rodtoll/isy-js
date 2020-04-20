import { KeypadDevice } from './InsteonDevice';
import { InsteonDimmableDevice } from './InsteonDimmableDevice';
import { InsteonRelayDevice } from './InsteonRelayDevice';
import { InsteonBaseDevice } from '../../ISY';

export class InsteonKeypadDimmerDevice extends KeypadDevice(InsteonDimmableDevice) {
	constructor (isy: any, deviceNode: any) {
		super(isy, deviceNode);
	}
}

export class InsteonKeypadRelayDevice extends KeypadDevice(InsteonRelayDevice) {
	constructor (isy: any, deviceNode: any) {
		super(isy, deviceNode);
	}
}