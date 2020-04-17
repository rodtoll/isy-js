import { InsteonDimmableDevice } from './Devices/Insteon/InsteonDimmableDevice';
import { Family } from './Families';
import { InsteonRelayDevice, ISY, ISYDevice } from './ISY';
import { Commands, DeviceTypes } from './ISYConstants';
import { ISYNode } from './ISYNode';

export class ISYScene extends ISYNode {
	public type: string;
	public connectionType: string;
	public batteryOperated: boolean;
	public deviceType: any;
	public deviceFriendlyName: string;
	public childDevices: ISYDevice<any>[];
	public isDimmable: boolean;
	public typeCode: string;
	constructor(isy: ISY, scene: { members?: any; flag?: any; nodeDefId?: string; address?: string; name?: string; family?: Family; parent?: any; enabled: boolean; ELK_ID?: string; }) {
		super(isy, scene);
		// this.logger(JSON.stringify(scene));
		this.typeCode = '';
		this.connectionType = 'Insteon Wired';
		this.batteryOperated = false;
		this.deviceType = DeviceTypes.scene;
		this.deviceFriendlyName = 'ISY Scene';
		this.childDevices = [];
		this.isDimmable = false;
		if (Array.isArray(scene.members.link)) {
			for (const node of scene.members.link) {
				if ('_' in node) {
					// childDevices.push(node._);
					// childDevices.push(object)
					const s = node._;
					const d = isy.getDevice(s);

					if (d !== null && d !== undefined) { d.addLink(this); }
					if (d instanceof InsteonDimmableDevice && node.type !== '16') { this.isDimmable = true; }
					this.childDevices[s] = d;
				}
			}
		} else if (scene.members.link !== undefined) {
			if ('_' in scene.members.link) {
				const node = scene.members.link;
				this.logger(JSON.stringify(node));
				// childDevices.push(node._);
				// childDevices.push(object)
				const s = scene.members.link._;
				const d = isy.getDevice(s);
				if (d !== null && d !== undefined) { d.addLink(this); }
				if ((d.isDimmable && node.type !== '16') || this.isDimmable) { this.isDimmable = true; }
				this.childDevices[s] = d;
			}
		}
		// check dimmability this.dimmable = Array.apply(p => p.dimmable);
		this.recalculateState();
	}
	// Get the current light state
	get isOn() {
		for (const device of this.childDevices) {
			if (device instanceof InsteonRelayDevice) {
				if (device.isOn) {
					return true;
				}
			}
		}
		return false;
	}
	get brightnessLevel() {
		let lightDeviceCount = 0;
		let blevel = 0;
		for (const device of this.childDevices) {
			if (device instanceof InsteonDimmableDevice) {
				lightDeviceCount++;
				blevel += device.brightnessLevel;
			} else if (device instanceof InsteonRelayDevice) {
				lightDeviceCount++;
				blevel += device.isOn ? 100 : 0;
			}
		}
		if (lightDeviceCount > 0) {
			return Math.floor(blevel / lightDeviceCount);
		} else {
			return 0;
		}
	}
	// Current light dim state is always calculated
	public recalculateState() {
		this.markAsChanged();
		return true;
	}
	public markAsChanged() {
		this.lastChanged = new Date();
		this.propertyChanged.emit('isOn', 'isOn', this.isOn, this.isOn ? 'on' : 'off');
		this.propertyChanged.emit('', 'isOn', this.isOn, this.isOn ? 'on' : 'off');
		if (this.isDimmable) {
			this.propertyChanged.emit('brightnessLevel', 'brightnesslevel', this.brightnessLevel, this.brightnessLevel);
			this.propertyChanged.emit('', 'brightnessLevel', this.brightnessLevel, this.brightnessLevel);
		}
	}
	public updateIsOn(lightState) {
		return this.isy.sendNodeCommand(this, lightState ? Commands.On : Commands.Off);
	}
	public updateBrightnessLevel(level) {
		return this.isy.sendNodeCommand(this, level > 0 ? Commands.On : Commands.Off, level);
	}
	public getAreAllLightsInSpecifiedState(state) {
		for (const device of this.childDevices) {
			if (device instanceof InsteonRelayDevice) {
				if (device.isOn !== state) {
					return false;
				}
			}
		}
		return true;
	}
}
