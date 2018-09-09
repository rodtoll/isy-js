var isy = require('./isy.js');

import {InsteonRelayDevice, InsteonDimmableDevice} from  './insteondevice.js';
import {ISYDevice} from './isydevice.js';
import { ISYNode } from "./ISYNode.js";
import {DeviceTypes, Commands, NodeTypes} from './isyconstants.js';
import { notDeepEqual } from 'assert';

export class ISYScene extends ISYNode {
    constructor(isy, scene) {
        super(isy,scene);
        //this.logger(JSON.stringify(scene));
        this.type = '';
        this.connectionType = 'Insteon Wired';
        this.batteryOperated = false;
        this.deviceType = DeviceTypes.scene;
        this.deviceFriendlyName = "ISY Scene";
        this.childDevices = new Map();
        this.isDimmable = false;
        if (Array.isArray(scene.members.link)) {
            for (let node of scene.members.link) {
                if ("_" in node) {
                    //childDevices.push(node._);
                    //childDevices.push(object)
                    let s= node._;
                    let d= isy.getDevice(s);
                    if(d !== null && d!== undefined)
                        d.addLink(this);
                    this.childDevices.set(s, d);
                }
            }
        } else if (scene.members.link !== undefined) {
            if ("_" in scene.members.link) {
                //childDevices.push(node._);
                //childDevices.push(object)
                let s= scene.members.link._;
                let d= isy.getDevice(s);
                if(d !== null && d!== undefined)
                    d.addLink(this);
                if(d.isDimmable)
                    this.isDimmable =true;
                this.childDevices.set(s, d);
            }
        }
        //check dimmability this.dimmable = Array.apply(p => p.dimmable);
        this.recalculateState();
    }

    get nodeType()
    {
        return NodeTypes.scene;
    }

    // Get the current light state
    get isOn() {
        for (let device of this.childDevices.values())
        {
            if (device instanceof InsteonRelayDevice) {
                if (device.isOn) {
                    return true;
                }
            }
        }
        return false;
    }

    get brightnessLevel()
    {
        var lightDeviceCount = 0;
        var blevel = 0;
        for (let device in this.childDevices.values())
        if (device.isDimmable) {
           
                lightDeviceCount++;
                blevel += device.brightnessLevel; 
            
        }
        else if (device instanceof InsteonRelayDevice)
        {
            lightDeviceCount++;
            blevel += device.isOn ? 100 : 0;
        }
        if (lightDeviceCount > 0) {
            return (blevel / lightDeviceCount);
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
        this.propertyChanged.emit('ST',this.isOn,this.isOn ? 'on':'off');
        this.propertyChanged.emit('',this.isOn,this.isOn ? 'on':'off');
        
      
    }

    sendLightCommand(lightState, resultHandler) {
        this.isy.sendRestCommand(this.address, (lightState) ? Commands.on : Commands.off, null, resultHandler);
    }

    getAreAllLightsInSpecifiedState(state) {
        for (let device in this.childDevices.values()) {
         
            if (device instanceof InsteonRelayDevice) {
                if (device.getCurrentLightState() != state) {
                    return false;
                }
            }
        }
        return true;
    }

    
}







