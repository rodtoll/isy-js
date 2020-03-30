import { ISY } from '../../ISY';
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
export const InsteonSwitchDevice = (InsteonBaseDevice: typeof InsteonRelayDevice) =>
	(class extends InsteonBaseDevice {
		constructor(isy: any, node: any) {
			super(isy, node);

		}
	});

export const KeypadDevice = (InsteonBaseDevice: any) => (class extends InsteonBaseDevice {
    constructor (isy: any, node: any) {
        super(isy, node);
    }
});


export class InsteonOutletDevice extends InsteonRelayDevice {
	constructor(isy: ISY, deviceNode: any) {
		super(isy, deviceNode);
	}
}
