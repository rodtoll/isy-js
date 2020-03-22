import { ISY } from '../../isy';
import { Commands } from '../../isyconstants';
import { byteToPct, pctToByte } from '../../utils';
import { InsteonRelayDevice } from './InsteonRelayDevice';

export const InsteonLampDevice = (InsteonBaseDevice: any) =>
	{
		return class extends InsteonBaseDevice {
			constructor (isy: any, node: any) {
				super(isy, node);
				this.isDimmable = true;
			}
			get brightnessLevel() {
				return byteToPct(this.status);
			}
			public updateBrightnessLevel(level: number, resultHandler: any) {
				if (level !== this.brightnessLevel) {
					this.isy.sendRestCommand(this.address, Commands.On, pctToByte(level), resultHandler);
				}
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
