import { EventEmitter } from 'events';
import { isNullOrUndefined } from 'util';

import { Categories, Controls, ISY, NodeTypes } from './ISY';
import { Families } from './ISYConstants';

export class ISYNode {
	public readonly isy: ISY;
	public readonly flag: any;
	public readonly nodeDefId: string;
	public readonly address: string;
	[x: string]: any
	public name: string;
	public displayName: string;
	public family: any;
	public folder: string = '';
	public parent: any;
	public parentType: number;
	public readonly elkId: string;
	public nodeType: number;
	public propertyChanged: EventEmitter;
	public propsInitialized: boolean;
	public logger: (msg: any) => void;
	public lastChanged: Date;
	public enabled: boolean;
	constructor (isy: ISY, node: any) {

		this.isy = isy;
		this.nodeType = 0;
		this.flag = node.flag;
		this.nodeDefId = node.nodeDefId;
		this.address = node.address;
		this.name = node.name;
		this.family = node.family;

		this.parent = node.parent;
		if (!isNullOrUndefined(this.parent)) {
			this.parentType = Number(this.parent.type);
		}
		this.enabled = node.enabled;
		this.elkId = node.ELK_ID;
		this.propertyChanged = new EventEmitter();
		this.propsInitialized = false;
		let s = this.name.split('.');
		if (s.length > 1)
			s.shift();
		this.displayName = s.join(' ').replace(/([A-Z])/g, ' $1').replace('  ',' ').trim();
		if (this.parentType === NodeTypes.Folder) {

			this.folder = isy.folderMap.get(this.parent._);
			isy.logger(`${this.name} this node is in folder ${this.folder}`);
			this.logger = (msg) => {
				return isy.logger(`${this.folder} ${this.name} (${this.address}): ${msg}`);
			};

			this.displayName = `${this.folder} ${this.displayName}`;
		}
		else {
			this.logger = (msg) => {
				return isy.logger(`${this.name} (${this.address}): ${msg}`);
			};
		}


		this.logger(this.nodeDefId);
		this.lastChanged = new Date();
	}

	public handlePropertyChange(propertyName: string, value: any, formattedValue: string): boolean {
		this.lastChanged = new Date();
		return true;
	}

	public handleEvent(event: any) {
		let actionValue = null;
		if (event.action instanceof Object) {
			actionValue = event.action._;
		} else if (event.action instanceof Number || event.action instanceof String) {
			actionValue = Number(event.action);
		}

		if (event.control in this) {
			// property not command
			const formatted = 'fmtAct' in event ? event.fmtAct : actionValue;
			return this.handlePropertyChange(event.control, actionValue, formatted);
		} else {
			// this.logger(event.control);
			const e = event.control;
			const dispName = Controls[e];
			if (dispName !== undefined && dispName !== null) {
				this.logger(`Command ${dispName.label} (${e}) triggered.`);
			} else {
				this.logger(`Command ${e} triggered.`);
			}
			return false;
		}
	}



	public onPropertyChanged(propertyName = null, callback: (...args) => void) {
		if (propertyName === null) {
			this.propertyChanged.addListener('', callback);
		} else { this.propertyChanged.addListener(propertyName, callback); }
	}
}
