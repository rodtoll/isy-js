import { ISY } from '../../isy';
import { ISYBinaryStateDevice } from '../../isydevice';
import { InsteonBaseDevice } from './InsteonBaseDevice';

export class InsteonSmokeSensorDevice extends ISYBinaryStateDevice(InsteonBaseDevice) {
	constructor (isy: ISY, deviceNode: {
		type: string;
	}) {
		super(isy, deviceNode);
	}
	get smokeDetected() {
		return this.state;
	}
}
