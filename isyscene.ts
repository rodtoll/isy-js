

import {ISYNode} from "./isynode";

import { ISYDevice,InsteonRelayDevice } from "./isy";
import { InsteonDimmableDevice } from "./insteondevice";
import { Commands, DeviceTypes } from "./isyconstants";

export class ISYScene extends ISYNode {
    type: string;
    connectionType: string;
    batteryOperated: boolean;
    deviceType: any;
    deviceFriendlyName: string;
    childDevices: ISYDevice[];
    isDimmable: boolean;
    typeCode: string;
    constructor(isy, scene) {
        super(isy, scene);
        //this.logger(JSON.stringify(scene));
        this.typeCode = '';
        this.connectionType = 'Insteon Wired';
        this.batteryOperated = false;
        this.deviceType = DeviceTypes.scene;
        this.deviceFriendlyName = "ISY Scene";
        this.childDevices = [];
        this.isDimmable = false;
        if (Array.isArray(scene.members.link)) {
            for (let node of scene.members.link) {
                
                if ("_" in node) {
                    //childDevices.push(node._);
                    //childDevices.push(object)
                    let s = node._;
                    let d = isy.getDevice(s);

                    if (d !== null && d !== undefined)
                        d.addLink(this);
                    if (d instanceof InsteonDimmableDevice && node.type != '16')
                        this.isDimmable = true;
                    this.childDevices[s] = d;
                }
            }
        }
        else if (scene.members.link !== undefined) {
            if ("_" in scene.members.link) {
                let node = scene.members.link;
                this.logger(JSON.stringify(node));
                //childDevices.push(node._);
                //childDevices.push(object)
                let s = scene.members.link._;
                let d = isy.getDevice(s);
                if (d !== null && d !== undefined)
                    d.addLink(this);
                if ((d.isDimmable && node.type != '16')|| this.isDimmable)
                    this.isDimmable = true;
                this.childDevices[s] = d;
            }
        }
        //check dimmability this.dimmable = Array.apply(p => p.dimmable);
        this.recalculateState();
    }
    // Get the current light state
    get isOn() {
        for (let device of this.childDevices) {
            if (device instanceof InsteonRelayDevice) {
                if (device.isOn) {
                    return true;
                }
            }
        }
        return false;
    }
    get brightnessLevel() {
        var lightDeviceCount = 0;
        var blevel = 0;
        for (let device of this.childDevices)
            if (device instanceof InsteonDimmableDevice) {
                lightDeviceCount++;
                blevel += device.brightnessLevel;
            }
            else if (device instanceof InsteonRelayDevice) {
                lightDeviceCount++;
                blevel += device.isOn ? 100 : 0;
            }
        if (lightDeviceCount > 0) {
            return Math.floor((blevel / lightDeviceCount));
        }
        else {
            return 0;
        }
    }
    // Current light dim state is always calculated
    recalculateState() {
        this.markAsChanged();
        return true;
    }
    markAsChanged() {
        this.lastChanged = new Date();
        this.propertyChanged.emit('isOn', 'isOn', this.isOn, this.isOn ? 'on' : 'off');
        this.propertyChanged.emit('', 'isOn', this.isOn, this.isOn ? 'on' : 'off');
        if (this.isDimmable) {
            this.propertyChanged.emit('brightnessLevel', 'brightnesslevel', this.brightnessLevel, this.brightnessLevel);
            this.propertyChanged.emit('', 'brightnessLevel', this.brightnessLevel, this.brightnessLevel);
        }
    }
    updateIsOn(lightState) {
        return this.isy.sendNodeCommand(this, (lightState) ? Commands.On : Commands.Off);
    }
    updateBrightnessLevel(level) {
        return this.isy.sendNodeCommand(this, (level > 0) ? Commands.On : Commands.Off, level);
    }
    getAreAllLightsInSpecifiedState(state) {
        for (let device of this.childDevices) {
            if (device instanceof InsteonRelayDevice) {
                if (device.isOn !== state) {
                    return false;
                }
            }
        }
        return true;
    }
}
