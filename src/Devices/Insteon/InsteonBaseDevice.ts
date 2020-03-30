import { Family } from '../../Families';
import { ISY } from '../../ISY';
import { byteToDegree, byteToPct, pctToByte } from '../../Utils';
import { ISYDevice } from '../ISYDevice';

//import { InsteonNLS } from './insteonfam'
export class InsteonBaseDevice extends ISYDevice {
	constructor (isy: ISY, node: {
		type: string;
	}) {
		super(isy, node);
		this.family = Family.Insteon;
		//this.productName = InsteonNLS.getDeviceDescription(String.fromCharCode(category,device,version));
		this.childDevices = {};
	}
	public convertFrom(value: any, uom: number): any {
		switch (uom) {
			case 101:
				return byteToDegree(value);
			case 100:
				return byteToPct(value);
			default:
				return super.convertFrom(value, uom);
		}
	}
	public convertTo(value: any, uom: number): any {
		const nuom = super.convertTo(value, uom);
		switch (uom) {
			case 101:
				return nuom * 2;
			case 100:
				return pctToByte(nuom);
			default:
				return nuom;
		}
	}
	public async sendBeep(level: number = 100): Promise<any> {
		return this.isy.sendNodeCommand(this, 'BEEP');
	}
}
