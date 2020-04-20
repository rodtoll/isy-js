import { ISY, ISYDevice, Family } from '../../ISY';
import { InsteonRelayDevice } from './InsteonRelayDevice';

export class InsteonOnOffOutletDevice extends InsteonRelayDevice {

	public outlet1 : InsteonRelayDevice;
	public outlet2 : InsteonRelayDevice;

	constructor(isy: ISY, deviceNode: any) {
		super(isy, deviceNode);
		this.outlet1 = new InsteonRelayDevice(isy, deviceNode);
		super.addChild(this.outlet1);

	}
	public addChild(childDevice: ISYDevice<Family.Insteon>) {
		super.addChild(childDevice);
		this.outlet2 = childDevice as InsteonRelayDevice;
		// if(childDevice)
	}
}

