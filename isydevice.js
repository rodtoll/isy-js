var isy = require('./isy.js');
var isyConstants = require('./isyconstants.js');


////////////////////////////////////////////////////////////////////////
// Support functions
//

function ISYDeviceInitialize(isy, name, address, deviceTypeInfo, device) {
	device.isy = isy;
	device.name = name;
	device.address = address;
	device.isyType = deviceTypeInfo.type;
	if(deviceTypeInfo != null) {
		device.deviceFriendlyName = deviceTypeInfo.name;
		device.deviceType = deviceTypeInfo.deviceType;
		device.connectionType = deviceTypeInfo.connectionType;
		device.batteryOperated = deviceTypeInfo.batteryOperated;
	} else {
		device.deviceFriendlyName = "Unknown";
		device.deviceType = isyConstants.DEVICE_TYPE_UNKNOWN;
		device.connectioNType = "ISY";
		device.batteryOperated = false;
	}	
}

////////////////////////////////////////////////////////////////////////
// ISYLightDevice
//

var ISYLightDevice = function(isy, name, address, deviceTypeInfo) {
	ISYDeviceInitialize(isy, name, address, deviceTypeInfo, this);
	this.lightState = false;
	this.dimLevel = 0;
}

ISYLightDevice.prototype.handleIsyUpdate = function(actionValue) {
	if(actionValue > 0) {
		var translatedDimLevel = Math.floor(actionValue*100/255);
		if(!this.currentLightState || this.dimLevel != translatedDimLevel) {
			this.currentLightState = true;
			this.dimLevel = translatedDimLevel;
			return true;
		}
	} else {
		if(this.currentLightState || this.dimLevel != 0) {
			this.currentLightState = false;
			this.dimLevel = 0;
			return true;
		}
	}
	return false;
}

ISYLightDevice.prototype.getCurrentLightState = function() {
	return this.currentLightState;
}

ISYLightDevice.prototype.getCurrentLightDimState = function() {
	return this.dimLevel;
}

ISYLightDevice.prototype.sendLightCommand = function(lightState,resultHandler) {
	this.isy.sendRestCommand(this.address, (lightState) ? isyConstants.ISY_COMMAND_LIGHT_ON : isyConstants.ISY_COMMAND_LIGHT_OFF, null, resultHandler);
}

ISYLightDevice.prototype.sendLightDimCommand = function(dimLevel,resultHandler) {
	var isyDimLevel = Math.floor(dimLevel*255/100);
	this.isy.sendRestCommand(this.address, isyConstants.ISY_COMMAND_LIGHT_ON, isyDimLevel, resultHandler);	
}

////////////////////////////////////////////////////////////////////////
// ISYLockDevice
//

var ISYLockDevice = function(isy, name, address, deviceTypeInfo) {
	ISYDeviceInitialize(isy, name, address, deviceTypeInfo, this);
	this.currentLockState = false;
}

ISYLockDevice.prototype.getCurrentLockState = function() {
	return this.currentLockState;
}

ISYLockDevice.prototype.sendLockCommand = function(lockState, resultHandler) {
	if(this.deviceType == isyConstants.DEVICE_TYPE_LOCK) {
		if(lockState) {
			this.isy.sendRestCommand(this.address, isyConstants.ISY_COMMAND_LOCK_LOCK, null, resultHandler);
		} else {
			this.isy.sendRestCommand(this.address, isyConstants.ISY_COMMAND_LOCK_UNLOCK, null, resultHandler);
		}
	} else if(this.deviceType == isyConstants.DEVICE_TYPE_SECURE_LOCK) {
		if(lockState) {
			this.isy.sendRestCommand(this.address, isyConstants.ISY_COMMAND_SECURE_LOCK_BASE,isyConstants.ISY_COMMAND_SECURE_LOCK_PARAMETER_LOCK,resultHandler);
		} else {
			this.isy.sendRestCommand(this.address, isyConstants.ISY_COMMAND_SECURE_LOCK_BASE,isyConstants.ISY_COMMAND_SECURE_LOCK_PARAMETER_UNLOCK,resultHandler);			
		}
	}
}

ISYLockDevice.prototype.handleIsyUpdate = function(actionValue) {
	var newLockState = false;
	if(this.deviceType == isyConstants.DEVICE_TYPE_LOCK) {
		if(actionValue == isyConstants.ISY_STATE_LOCK_UNLOCKED) {
			newLockState = false;
		} else {
			newLockState = true;
		}
	} else if(this.deviceType == isyConstants.DEVICE_TYPE_SECURE_LOCK) {
		if(actionValue > 0) {
			newLockState = true;
		} else {
			newLockState = false;
		}
	}
	if(newLockState != this.currentLockState) {
		this.currentLockState = newLockState;
		return true;
	} else {
		return false;
	}
}

////////////////////////////////////////////////////////////////////////
// ISYDoorWindowDevice
//

var ISYDoorWindowDevice = function(isy, name, address, deviceTypeInfo) {
	ISYDeviceInitialize(isy, name, address, deviceTypeInfo, this);
	this.currentDoorWindowState = false;
}

ISYDoorWindowDevice.prototype.getCurrentDoorWindowState = function() {
	return this.currentDoorWindowState;
}

ISYDoorWindowDevice.prototype.handleIsyUpdate = function(actionValue) {
	var newSensorState = (actionValue == isyConstants.ISY_STATE_DOOR_WINDOW_CLOSED) ? false : true;
	if(newSensorState != this.currentDoorWindowState) {
		this.currentDoorWindowState = newSensorState;
		return true;
	} else {
		return false;
	}
}

////////////////////////////////////////////////////////////////////////
// ISYOutletDevice
//

var ISYOutletDevice = function(isy, name, address, deviceTypeInfo) {
	ISYDeviceInitialize(isy, name, address, deviceTypeInfo, this);
	this.currentOutletState = false;
}

ISYOutletDevice.prototype.getCurrentOutletState = function() {
	return this.currentOutletState;
}

ISYOutletDevice.prototype.handleIsyUpdate = function(actionValue) {
	var newOutletState = (actionValue > 0) ? true : false;
	if(newOutletState != this.currentOutletState) {
		this.currentOutletState = newOutletState;
		return true;
	} else {
		return false;
	}
}

ISYOutletDevice.prototype.sendOutletCommand = function(outletState,resultHandler) {
	this.isy.sendRestCommand(this.addres, (outletState) ? isyConstants.ISY_COMMAND_OUTLET_ON : isyConstants.ISY_COMMAND_OUTLET_OFF, null, resultHandler);
}

////////////////////////////////////////////////////////////////////////
// ISYFanDevice
//

var ISYFanDevice = function(isy, name, address, deviceTypeInfo) {
	ISYDeviceInitialize(isy, name, address, deviceTypeInfo, this);
	this.currentFanState = isyConstants.USER_COMMAND_FAN_OFF;
}

ISYFanDevice.prototype.getCurrentFanState = function(fanState) {
	return this.currentFanState;
}

ISYFanDevice.prototype.sendFanCommand = function(fanState, resultHandler) {
	if(fanState == isyConstants.USER_COMMAND_FAN_OFF) {
		this.isy.sendRestCommand(this.address, isyConstants.ISY_COMMAND_FAN_OFF, null, resultHandler);
	} else if(fanState == isyConstants.USER_COMMAND_FAN_LOW) {
		this.isy.sendRestCommand(this.address, isyConstants.ISY_COMMAND_FAN_BASE, isyConstants.ISY_COMMAND_FAN_PARAMETER_LOW, resultHandler);		
	} else if(fanState == isyConstants.USER_COMMAND_FAN_MEDIUM) {
		this.isy.sendRestCommand(this.address, isyConstants.ISY_COMMAND_FAN_BASE, isyConstants.ISY_COMMAND_FAN_PARAMETER_MEDIUM, resultHandler);				
	} else if(fanState == isyConstants.USER_COMMAND_FAN_HIGH) {
		this.isy.sendRestCommand(this.address, isyConstants.ISY_COMMAND_FAN_BASE, isyConstants.ISY_COMMAND_FAN_PARAMETER_HIGH, resultHandler);				
	}
}

ISYFanDevice.prototype.handleIsyUpdate = function(actionValue) {
	var newFanState = isyConstants.USER_COMMAND_FAN_OFF;
	if(actionValue == 0) {
		newFanState = isyConstants.USER_COMMAND_FAN_OFF;
	} else if(actionValue == isyConstants.ISY_COMMAND_FAN_PARAMETER_LOW) {
		newFanState = isyConstants.USER_COMMAND_FAN_LOW;
	} else if(actionValue == isyConstants.ISY_COMMAND_FAN_PARAMETER_MEDIUM) {
		newFanState = isyConstants.USER_COMMAND_FAN_MEDIUM;
	} else if(actionValue == isyConstants.ISY_COMMAND_FAN_PARAMETER_HIGH) {
		newFanState = isyConstants.USER_COMMAND_FAN_HIGH;
	}
	if(newFanState != this.currentFanState) {
		this.currentFanState = newFanState;
		return true;
	} else {
		return false;
	}
}


exports.ISYOutletDevice = ISYOutletDevice;
exports.ISYLightDevice = ISYLightDevice;
exports.ISYLockDevice = ISYLockDevice;
exports.ISYDoorWindowDevice = ISYDoorWindowDevice;
exports.ISYFanDevice = ISYFanDevice;
