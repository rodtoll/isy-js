import { ISY } from '../../isy';
import { InsteonRelayDevice } from './InsteonRelayDevice';

export class InsteonOnOffOutletDevice extends InsteonRelayDevice {
	constructor (isy: ISY, deviceNode: any) {
		super(isy, deviceNode);
	}
}
