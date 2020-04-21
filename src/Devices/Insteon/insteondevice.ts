import { ISY, InsteonBaseDevice, Family, ISYDevice } from '../../ISY';

import { Commands } from '../../ISYConstants';
import { InsteonRelayDevice } from './InsteonRelayDevice';

export const InsteonLampDevice = (InsteonBaseDevice: any) =>
	{
		return class extends InsteonBaseDevice {
			constructor (isy: any, node: any) {
				super(isy, node);
				this.isDimmable = true;
			}

		};
	};
// tslint:disable-next-line: variable-name
export const InsteonSwitchDevice = (InsteonBaseDevice: any) =>
	(class extends InsteonBaseDevice {
		constructor(isy: any, node: any) {
			super(isy, node);

		}
	});

export const KeypadDevice = (IB: any) => (class extends IB {
    constructor (isy: any, node: any) {
        super(isy, node);
	}

	public addChild(childDevice: ISYDevice<Family.Insteon>)
	{

		super.addChild(childDevice);
	}
});


export class InsteonOutletDevice extends InsteonRelayDevice {
	constructor(isy: ISY, deviceNode: any) {
		super(isy, deviceNode);
	}
}
