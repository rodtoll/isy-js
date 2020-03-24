Object.defineProperty(exports, "__esModule", { value: true });
const InsteonDimmableDevice_1 = require("./Devices/Insteon/InsteonDimmableDevice");
const ISY_1 = require("./ISY");
const ISYConstants_1 = require("./ISYConstants");
const ISYNode_1 = require("./ISYNode");
class ISYScene extends ISYNode_1.ISYNode {
    constructor(isy, scene) {
        super(isy, scene);
        // this.logger(JSON.stringify(scene));
        this.typeCode = '';
        this.connectionType = 'Insteon Wired';
        this.batteryOperated = false;
        this.deviceType = ISYConstants_1.DeviceTypes.scene;
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
                    if (d !== null && d !== undefined) {
                        d.addLink(this);
                    }
                    if (d instanceof InsteonDimmableDevice_1.InsteonDimmableDevice && node.type !== '16') {
                        this.isDimmable = true;
                    }
                    this.childDevices[s] = d;
                }
            }
        }
        else if (scene.members.link !== undefined) {
            if ('_' in scene.members.link) {
                const node = scene.members.link;
                this.logger(JSON.stringify(node));
                // childDevices.push(node._);
                // childDevices.push(object)
                const s = scene.members.link._;
                const d = isy.getDevice(s);
                if (d !== null && d !== undefined) {
                    d.addLink(this);
                }
                if ((d.isDimmable && node.type !== '16') || this.isDimmable) {
                    this.isDimmable = true;
                }
                this.childDevices[s] = d;
            }
        }
        // check dimmability this.dimmable = Array.apply(p => p.dimmable);
        this.recalculateState();
    }
    // Get the current light state
    get isOn() {
        for (const device of this.childDevices) {
            if (device instanceof ISY_1.InsteonRelayDevice) {
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
            if (device instanceof InsteonDimmableDevice_1.InsteonDimmableDevice) {
                lightDeviceCount++;
                blevel += device.brightnessLevel;
            }
            else if (device instanceof ISY_1.InsteonRelayDevice) {
                lightDeviceCount++;
                blevel += device.isOn ? 100 : 0;
            }
        }
        if (lightDeviceCount > 0) {
            return Math.floor(blevel / lightDeviceCount);
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
        return this.isy.sendNodeCommand(this, lightState ? ISYConstants_1.Commands.On : ISYConstants_1.Commands.Off);
    }
    updateBrightnessLevel(level) {
        return this.isy.sendNodeCommand(this, level > 0 ? ISYConstants_1.Commands.On : ISYConstants_1.Commands.Off, level);
    }
    getAreAllLightsInSpecifiedState(state) {
        for (const device of this.childDevices) {
            if (device instanceof ISY_1.InsteonRelayDevice) {
                if (device.isOn !== state) {
                    return false;
                }
            }
        }
        return true;
    }
}
exports.ISYScene = ISYScene;
