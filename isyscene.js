var ISYLightDevice = require('./isydevice.js').ISYLightDevice;
var ISYDefs = require("./isydefs.json");

var ISYScene = function(isy, name, address, childDevices) {
    this.isy = isy;
    this.name = name;
    this.address = address;
    this.isyType = '';
    this.connectionType = 'Insteon Wired';
    this.batteryOperated = false;
    this.childDevices = childDevices;
    this.deviceType = ISYDefs.deviceType.SCENE;
    this.deviceFriendlyName = "Insteon Scene";
    this.lastChanged = new Date();
    this.reclalculateState();
};

// Get the current light state
ISYScene.prototype.getCurrentLightState = function() {
    for (var i = 0; i < this.childDevices.length; i++) {
        var device = this.childDevices[i];
        if (device instanceof ISYLightDevice) {
            if (device.getCurrentLightState()) {
                return true;
            }
        }
    }
	return false;
};

// Current light dim state is always calculated
ISYScene.prototype.getCurrentLightDimState = function() {
    var lightDeviceCount = 0;
    var calculatedDimLevel = 0;
    for (var i = 0; i < this.childDevices.length; i++) {
        var device = this.childDevices[i];
        if (device instanceof ISYLightDevice) {
            calculatedDimLevel += device.getCurrentLightDimState();
            lightDeviceCount++;
        }
    }
    if (lightDeviceCount > 0) {
        return (calculatedDimLevel / lightDeviceCount);
    } else {
        return 0;
    }
};

ISYScene.prototype.reclalculateState = function() {
    this.markAsChanged();
    return true;
};

ISYScene.prototype.markAsChanged = function() {
    this.lastChanged = new Date();
};

ISYScene.prototype.sendLightCommand = function(lightState, resultHandler) {
    this.isy.sendRestCommand(this.address, (lightState) ? ISYDefs.cmd.LIGHT_ON : ISYDefs.cmd.LIGHT_OFF, null, resultHandler);
};

ISYScene.prototype.getAreAllLightsInSpecifiedState = function(state) {
    for (var i = 0; i < this.childDevices.length; i++) {
        var device = this.childDevices[i];
        if (device instanceof ISYLightDevice) {
            if (device.getCurrentLightState() != state) {
                return false;
            }
        }
    }
    return true;
};

ISYScene.prototype.isDeviceIncluded = function(device) {
    for (var i = 0; i < this.childDevices.length; i++) {
        if (this.childDevices[i].address == device.address) {
            return true;
        }
    }
    return false;
};

exports.ISYScene = ISYScene;