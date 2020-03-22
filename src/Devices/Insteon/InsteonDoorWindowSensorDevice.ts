import { ISY } from '../../isy';
import { ISYBinaryStateDevice } from '../../isydevice';
import { InsteonBaseDevice } from './InsteonBaseDevice';

export class InsteonDoorWindowSensorDevice extends ISYBinaryStateDevice(InsteonBaseDevice) {
	constructor (isy: ISY, deviceNode: {
		type: string;
	}) {
		super(isy, deviceNode);
	}
	get isOpen() {
		return this.state;
	}
}
