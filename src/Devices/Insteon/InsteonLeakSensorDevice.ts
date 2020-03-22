import { ISY } from '../../isy';
import { ISYBinaryStateDevice } from '../../isydevice';
import { InsteonBaseDevice } from './InsteonBaseDevice';

export class InsteonLeakSensorDevice extends ISYBinaryStateDevice(InsteonBaseDevice) {
	constructor (isy: ISY, deviceNode: {
		type: string;
	}) {
		super(isy, deviceNode);
	}
	get leakDetected() {
		return this.state;
	}
}
