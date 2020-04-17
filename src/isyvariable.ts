import { EventEmitter } from 'events';
import { ISY } from './ISY';
import { VariableType } from './ISYConstants';

export class ISYVariable extends EventEmitter {
	public isy: ISY;
	public id: number;
	public name: string;
	public value: any;
	public init: any;
	public type: VariableType;
	public lastChanged: Date;
	constructor(isy: ISY, id: number, name: string, type: any) {
		super();
		this.isy = isy;
		this.id = id;
		this.name = name;
		this.value = undefined;
		this.init = undefined;
		this.type = type;
		this.lastChanged = new Date();
	}

	public handleEvent(event: any)
	{
		const varNode = event.eventInfo.var;
		if (varNode !== null) {
			const id = varNode.id;
			const type = varNode.type;
			const priorVal = this.value;
			this.value = parseInt(varNode.val);
			const year = parseInt(varNode.ts.substr(0, 4));
			const month = parseInt(varNode.ts.substr(4, 2));
			const day = parseInt(varNode.ts.substr(6, 2));
			const hour = parseInt(varNode.ts.substr(9, 2));
			const min = parseInt(varNode.ts.substr(12, 2));
			const sec = parseInt(varNode.ts.substr(15, 2));
			 this.lastChanged = new Date(year, month, day, hour, min, sec);
			this.emit('ValueChanged',this.value, priorVal);
	

		}
	}

	public markAsChanged() {
		this.lastChanged = new Date();
	}
	public sendSetValue(value, onComplete) {
		this.isy.sendSetVariable(this.id, this.type, value, (success) => onComplete(success));
	}

	public async updateValue(value: any): Promise<void> {
		const p = await this.isy.callISY(`vars\\${this.type}\\${this.id}\\${value}`);
		this.value = value;
		return p;
	}

}
