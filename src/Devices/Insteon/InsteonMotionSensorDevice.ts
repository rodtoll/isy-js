import { ISY } from '../../isy';
import { Commands } from '../../isyconstants';
import { InsteonBaseDevice } from './InsteonBaseDevice';

export class InsteonMotionSensorDevice extends InsteonBaseDevice {
	constructor (isy: ISY, deviceNode: {
		type: string;
	}) {
		super(isy, deviceNode);
		this._isMotionDetected = false;
	}
	public handleEvent(event: {
		control: string;
	}) {
		if (!super.handleEvent(event)) {
			if (event.control === Commands.On) {
				this.logger('Motion detected.');
				this._isMotionDetected = true;
				this.propertyChanged.emit('', 'motionDetected', true, true);
				setTimeout(() => {
					this.logger('No motion detected in last 30 seconds.');
					this._isMotionDetected = false;
					this.propertyChanged.emit('', 'motionDetected', false, false);
				}, 30000);
			}
			else if (event.control === Commands.Off) {
				this._isMotionDetected = false;
				this.logger('No motion detected.');
				this.propertyChanged.emit('', 'motionDetected', false, false);
			}
		}
		return true;
	}
	get isMotionDetected() {
		return this._isMotionDetected;
	}
}
