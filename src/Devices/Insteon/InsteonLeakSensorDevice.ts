import { ISY } from '../../ISY';
import { ISYBinaryStateDevice } from '../ISYDevice';
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
