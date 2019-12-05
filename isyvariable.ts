import { ISY } from './isy';

export class ISYVariable {
		public isy: ISY;
		public id: any;
		public name: any;
		public value: any;
		public init: any;
		public type: any;
		public lastChanged: Date;
		constructor(isy: ISY, id: string, name: string, type: any) {
				this.isy = isy;
				this.id = id;
				this.name = name;
				this.value = undefined;
				this.init = undefined;
				this.type = type;
				this.lastChanged = new Date();
		}
		public markAsChanged() {
				this.lastChanged = new Date();
		}
		public sendSetValue(value, onComplete) {
				this.isy.sendSetVariable(this.id, this.type, value, function(success) {
						onComplete(success);
				});
		}
		public async updateValue(value): Promise<void> {
				const p = await this.isy.callISY(`vars\\${this.type}\\${this.id}\\${value}`);
				this.value = value;
				return p;
		}

}
