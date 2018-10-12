import { Controls, ISY } from './isy';
import { EventEmitter } from 'events';

export class ISYNode {
	readonly isy: ISY;
	readonly flag: any;
	readonly nodeDefId: string;
	readonly address: string;
	[x: string]: any;
	name: string;
	family: any;
	parent: any;
	readonly elkId: string;
	nodeType: number;
	propertyChanged: EventEmitter;
	propsInitialized: boolean;
	logger: (msg: any) => void;
	lastChanged: Date;
	enabled: boolean;
	constructor(isy: ISY, node) {
		this.isy = isy;
		this.nodeType = 0;
		this.flag = node.flag;
		this.nodeDefId = node.nodeDefId;
		this.address = node.address;
		this.name = node.name;
		this.family = node.family;
		this.parent = node.parent;
		this.enabled = node.enabled;
		this.elkId = node.ELK_ID;
		this.propertyChanged = new EventEmitter();
		this.propsInitialized = false;
		this.logger = (msg) => {
			return isy.logger(`${this.name} (${this.address}): ${msg}`);
		};
		this.logger(this.nodeDefId);
		this.lastChanged = new Date();
	}

	handlePropertyChange(propertyName, value, formattedValue): boolean {
		this.lastChanged = new Date();
		return true;
	}

	handleEvent(event) {
		let actionValue = null;
		if (event.action instanceof Object) {
			actionValue = event.action._;
		} else if (event.action instanceof Number || event.action instanceof String) {
			actionValue = Number(event.action);
		}

		if (event.control in this) {
			//property not command
			var formatted = 'fmtAct' in event ? event.fmtAct : actionValue;
			return this.handlePropertyChange(event.control, actionValue, formatted);
		} else {
			//this.logger(event.control);
			var e = event.control;
			var dispName = Controls[e];
			if (dispName !== undefined && dispName !== null) {
				this.logger(`Command ${dispName.label} (${e}) triggered.`);
			} else {
				this.logger(`Command ${e} triggered.`);
			}
			return false;
		}
	}

	onPropertyChanged(propertyName = null, callback) {
		if (propertyName === null) {
			this.propertyChanged.addListener('', callback);
		} else this.propertyChanged.addListener(propertyName, callback);
	}
}
