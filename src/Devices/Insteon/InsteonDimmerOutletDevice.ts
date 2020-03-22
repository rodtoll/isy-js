import { InsteonDimmableDevice } from './InsteonDimmableDevice';

export class InsteonDimmerOutletDevice extends InsteonDimmableDevice {
	constructor (isy: any, deviceNode: any) {
		super(isy, deviceNode);
	}
}
