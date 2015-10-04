var isy = require('./isydevice');
var isyDeviceTypeList = require("./isydevicetypes.json");
var isyConstants = require('./isyconstants.js');

var ISYDevice = function(isy, name, address, isyType) {
	this.isy = isy;
	this.name = name;
	this.address = address;
	this.isyType = isyType;
	var deviceTypeInfo = isyTypeToTypeName(this.isyType,this.address);
	if(deviceTypeInfo != null) {
		this.deviceFriendlyName = deviceTypeInfo.name;
		this.deviceType = deviceTypeInfo.deviceType;
		this.connectionType = deviceTypeInfo.connectionType;
		this.batteryOperated = deviceTypeInfo.batteryOperated;
	} else {
		this.deviceFriendlyName = "Unknown";
		this.deviceType = isyConstants.DEVICE_TYPE_UNKNOWN;
		this.connectioNType = "ISY";
		this.batteryOperated = false;
	}
}

ISYDevice.prototype.setCurrentLightState = function(lightState) {
	var tmpLightState = this.currentLightState;
	this.currentLightState = lightState;	
	if(lightState != tmpLightState) {
		this.isy.nodeChangedHandler(this);
	}
}

ISYDevice.prototype.getCurrentLightState = function() {
	return this.currentLightState;
}

ISYDevice.prototype.sendLightCommand = function(lightOn) {
	if(lightOn) {
		this.isy.sendCommand(this,isyConstants.USER_COMMAND_LIGHT_ON);
	} else {
		this.isy.sendCommand(this,isyConstants.USER_COMMAND_LIGHT_OFF);
	}
}

ISYDevice.prototype.getCurrentLightDimLevel = function() {
	return this.currentLightDimState;
}

ISYDevice.prototype.setCurrentLightDimLevel = function(lightDimState) {
	this.currentLightDimState = lightDimState;	
} 

ISYDevice.prototype.sendLightDimCommand = function(lightLevel) {
	this.isy.sendCommand(this,isyConstants.USER_COMMAND_LIGHT_ON, lightLevel);
}

ISYDevice.prototype.setCurrentLockState = function(lockState) {
	var tmpLockState = this.currentLockState;
	this.currentLockState = lockState;
	if(lockState != tmpLockState) {
		this.isy.nodeChangedHandler(this);
	}
}

ISYDevice.prototype.getCurrentLockState = function() {
	return this.currentLockState;
}

ISYDevice.prototype.sendLockCommand = function(lock) {
	if(lock) {
		this.isy.sendCommand(this,isyConstants.USER_COMMAND_LOCK_LOCK);
	} else {
		this.isy.sendCommand(this,isyConstants.USER_COMMAND_LOCK_UNLOCK);
	}
}

ISYDevice.prototype.setCurrentDoorWindowState = function(doorWindowState) {
	var tmpDoorWindowState = this.currentDoorWindowState;
	this.currentDoorWindowState = doorWindowState;
	if(doorWindowState != tmpDoorWindowState) {
		this.isy.nodeChangedHandler(this);
	}	
}

ISYDevice.prototype.getCurrentDoorWindowState = function() {
	return this.currentDoorWindowState;
}

ISYDevice.prototype.setCurrentOutletState = function(outletState) {
	var tmpOutletState = this.currentOutletState;
	this.currentOutletState = outletState;
	if(outletState != tmpOutletState) {
		this.isy.nodeChangedHandler(this);
	}
}

ISYDevice.prototype.getCurrentOutletState = function() {
	return this.currentOutletState;
}

ISYDevice.prototype.sendOutletCommand = function(outletState) {
	if(outletState) {
		this.isy.sendCommand(this,isyConstants.USER_COMMAND_OUTLET_ON);
	} else {
		this.isy.sendCommand(this,isyConstants.USER_COMMAND_OUTLET_OFF);
	}
}

ISYDevice.prototype.setCurrentFanState = function(fanState) {
	var tmpFanState = this.currentFanState;
	this.currentFanState = fanState;
	if(fanState != tmpFanState) {
		this.isy.nodeChangedHandler(this);
	}
}

ISYDevice.prototype.getCurrentFanState = function() {
	return this.currentFanState;
}

ISYDevice.prototype.sendFanCommand = function(fanState) {
	this.isy.sendCommand(this,fanState);
}

function isyTypeToTypeName(isyType,address) {
	for(var index = 0; index < isyDeviceTypeList.length; index++ ) {
		if(isyDeviceTypeList[index].type == isyType) {
			var addressElementValue = isyDeviceTypeList[index].address;
			if( addressElementValue != "") {
				var lastAddressNumber = address[address.length-1];
				if(lastAddressNumber != addressElementValue) {
					continue;
				}
			}
			return isyDeviceTypeList[index];
		}		
	}
	return null;
} 

exports.ISYDevice = ISYDevice;
