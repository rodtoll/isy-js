import { ISY } from '../../ISY';
import { KeypadDevice } from './InsteonDevice';
import { InsteonRelayDevice } from './InsteonRelayDevice';


export class InsteonKeypadButtonDevice extends InsteonRelayDevice {
	constructor (isy: ISY, deviceNode: any) {
		super(isy, deviceNode);
	}
}
