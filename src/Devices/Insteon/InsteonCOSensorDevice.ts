import { ISY } from '../../ISY';
import { ISYBinaryStateDevice } from '../ISYDevice';
import { InsteonBaseDevice } from './InsteonBaseDevice';

export class InsteonCOSensorDevice extends ISYBinaryStateDevice(InsteonBaseDevice) {
	constructor (isy: ISY, deviceNode: {
		type: string;
	}) {
		super(isy, deviceNode);
	}
	get monoxideDetected() {
		return this.state;
	}
}
