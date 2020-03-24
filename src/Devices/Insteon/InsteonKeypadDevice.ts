import { ISY } from '../../ISY';
import { KeypadDevice } from './InsteonDevice';
import { InsteonRelayDevice } from './InsteonRelayDevice';

export class InsteonKeypadDevice extends KeypadDevice(InsteonRelayDevice) {
	constructor (isy: ISY, deviceNode: any) {
		super(isy, deviceNode);
	}
}
