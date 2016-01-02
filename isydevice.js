var isy = require('./isy.js');

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
		device.deviceType = isy.DEVICE_TYPE_UNKNOWN;
		device.connectioNType = "ISY";
		device.batteryOperated = false;
	}	
}

////////////////////////////////////////////////////////////////////////
// ISYLightDevice
//

var ISYLightDevice = function(isy, name, address, deviceTypeInfo) {
	ISYDeviceInitialize(isy, name, address, deviceTypeInfo, this);
	this.currentLightState = false;
	this.dimLevel = this.DIM_LEVEL_MINIMUM;
}

ISYLightDevice.prototype.DIM_LEVEL_MINIMUM = 0;
ISYLightDevice.prototype.DIM_LEVEL_MAXIMUM = 100;
ISYLightDevice.prototype.ISY_DIM_LEVEL_MAXIMUM = 255;
ISYLightDevice.prototype.ISY_COMMAND_LIGHT_ON = "DON";
ISYLightDevice.prototype.ISY_COMMAND_LIGHT_OFF = "DOF";

ISYLightDevice.prototype.handleIsyUpdate = function(actionValue) {
	if(actionValue > 0) {
		var translatedDimLevel = Math.floor(actionValue*this.DIM_LEVEL_MAXIMUM/this.ISY_DIM_LEVEL_MAXIMUM);
		if(!this.currentLightState || this.dimLevel != translatedDimLevel) {
			this.currentLightState = true;
			this.dimLevel = translatedDimLevel;
			return true;
		}
	} else {
		if(this.currentLightState || this.dimLevel != this.DIM_LEVEL_MINIMUM) {
			this.currentLightState = false;
			this.dimLevel = this.DIM_LEVEL_MINIMUM;
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
	this.isy.sendRestCommand(this.address, (lightState) ? this.ISY_COMMAND_LIGHT_ON : this.ISY_COMMAND_LIGHT_OFF, null, resultHandler);
}

ISYLightDevice.prototype.sendLightDimCommand = function(dimLevel,resultHandler) {
	var isyDimLevel = Math.round(dimLevel*this.ISY_DIM_LEVEL_MAXIMUM/this.DIM_LEVEL_MAXIMUM);
	this.isy.sendRestCommand(this.address, this.ISY_COMMAND_LIGHT_ON, isyDimLevel, resultHandler);	
}

////////////////////////////////////////////////////////////////////////
// ISYLockDevice
//

var ISYLockDevice = function(isy, name, address, deviceTypeInfo) {
	ISYDeviceInitialize(isy, name, address, deviceTypeInfo, this);
	this.currentLockState = false;
}

ISYLockDevice.prototype.ISY_COMMAND_LOCK_LOCK = "DON";
ISYLockDevice.prototype.ISY_COMMAND_LOCK_UNLOCK = "DOF";
ISYLockDevice.prototype.ISY_COMMAND_SECURE_LOCK_BASE = 'SECMD';
ISYLockDevice.prototype.ISY_COMMAND_SECURE_LOCK_PARAMETER_LOCK = '1';
ISYLockDevice.prototype.ISY_COMMAND_SECURE_LOCK_PARAMETER_UNLOCK = '0';
ISYLockDevice.prototype.ISY_STATE_LOCK_UNLOCKED = '0';

ISYLockDevice.prototype.getCurrentLockState = function() {
	return this.currentLockState;
}

ISYLockDevice.prototype.sendLockCommand = function(lockState, resultHandler) {
	if(this.deviceType == this.isy.DEVICE_TYPE_LOCK) {
		if(lockState) {
			this.isy.sendRestCommand(this.address, this.ISY_COMMAND_LOCK_LOCK, null, resultHandler);
		} else {
			this.isy.sendRestCommand(this.address, this.ISY_COMMAND_LOCK_UNLOCK, null, resultHandler);
		}
	} else if(this.deviceType == this.isy.DEVICE_TYPE_SECURE_LOCK) {
		if(lockState) {
			this.isy.sendRestCommand(this.address, this.ISY_COMMAND_SECURE_LOCK_BASE,this.ISY_COMMAND_SECURE_LOCK_PARAMETER_LOCK,resultHandler);
		} else {
			this.isy.sendRestCommand(this.address, this.ISY_COMMAND_SECURE_LOCK_BASE,this.ISY_COMMAND_SECURE_LOCK_PARAMETER_UNLOCK,resultHandler);			
		}
	}
}

ISYLockDevice.prototype.handleIsyUpdate = function(actionValue) {
	var newLockState = false;
	if(this.deviceType == this.isy.DEVICE_TYPE_LOCK) {
		if(actionValue == this.ISY_STATE_LOCK_UNLOCKED) {
			newLockState = false;
		} else {
			newLockState = true;
		}
	} else if(this.deviceType == this.isy.DEVICE_TYPE_SECURE_LOCK) {
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

ISYDoorWindowDevice.prototype.ISY_STATE_DOOR_WINDOW_CLOSED = '0';

ISYDoorWindowDevice.prototype.getCurrentDoorWindowState = function() {
	return this.currentDoorWindowState;
}

ISYDoorWindowDevice.prototype.handleIsyUpdate = function(actionValue) {
	var newSensorState = (actionValue == this.ISY_STATE_DOOR_WINDOW_CLOSED) ? false : true;
	if(newSensorState != this.currentDoorWindowState) {
		this.currentDoorWindowState = newSensorState;
		return true;
	} else {
		return false;
	}
}

////////////////////////////////////////////////////////////////////////
// ISYMotionSensorDevice
//

var ISYMotionSensorDevice = function(isy, name, address, deviceTypeInfo) {
	ISYDeviceInitialize(isy, name, address, deviceTypeInfo, this);
	this.currentMotionSensorState = false;
}

ISYMotionSensorDevice.prototype.ISY_STATE_MOTION_SENSOR_ON = '255';

ISYMotionSensorDevice.prototype.getCurrentMotionSensorState = function() {
	return this.currentMotionSensorState;
}

ISYMotionSensorDevice.prototype.handleIsyUpdate = function(actionValue) {
	var newSensorState = (actionValue == this.ISY_STATE_MOTION_SENSOR_ON) ? true : false;
	if(newSensorState != this.currentMotionSensorState) {
		this.currentMotionSensorState = newSensorState;
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

ISYOutletDevice.prototype.ISY_COMMAND_OUTLET_ON = 'DON';
ISYOutletDevice.prototype.ISY_COMMAND_OUTLET_OFF = 'DOF';

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
	this.isy.sendRestCommand(this.address, (outletState) ? this.ISY_COMMAND_OUTLET_ON : this.ISY_COMMAND_OUTLET_OFF, null, resultHandler);
}

////////////////////////////////////////////////////////////////////////
// ISYFanDevice
//

var ISYFanDevice = function(isy, name, address, deviceTypeInfo) {
	ISYDeviceInitialize(isy, name, address, deviceTypeInfo, this);
	this.currentFanState = this.FAN_OFF;
}

ISYFanDevice.prototype.FAN_OFF = 'Off';
ISYFanDevice.prototype.FAN_LEVEL_LOW = 'Low';
ISYFanDevice.prototype.FAN_LEVEL_MEDIUM = 'Medium';
ISYFanDevice.prototype.FAN_LEVEL_HIGH = 'High';
ISYFanDevice.prototype.ISY_COMMAND_FAN_BASE = 'DON';
ISYFanDevice.prototype.ISY_COMMAND_FAN_OFF = 'DOF';
ISYFanDevice.prototype.ISY_COMMAND_FAN_PARAMETER_LOW = 63;
ISYFanDevice.prototype.ISY_COMMAND_FAN_PARAMETER_MEDIUM = 191;
ISYFanDevice.prototype.ISY_COMMAND_FAN_PARAMETER_HIGH = 255;

ISYFanDevice.prototype.getCurrentFanState = function(fanState) {
	return this.currentFanState;
}

ISYFanDevice.prototype.sendFanCommand = function(fanState, resultHandler) {
	if(fanState == this.FAN_OFF) {
		this.isy.sendRestCommand(this.address, this.ISY_COMMAND_FAN_OFF, null, resultHandler);
	} else if(fanState == this.FAN_LEVEL_LOW) {
		this.isy.sendRestCommand(this.address, this.ISY_COMMAND_FAN_BASE, this.ISY_COMMAND_FAN_PARAMETER_LOW, resultHandler);		
	} else if(fanState == this.FAN_LEVEL_MEDIUM) {
		this.isy.sendRestCommand(this.address, this.ISY_COMMAND_FAN_BASE, this.ISY_COMMAND_FAN_PARAMETER_MEDIUM, resultHandler);				
	} else if(fanState == this.FAN_LEVEL_HIGH) {
		this.isy.sendRestCommand(this.address, this.ISY_COMMAND_FAN_BASE, this.ISY_COMMAND_FAN_PARAMETER_HIGH, resultHandler);				
	}
}

ISYFanDevice.prototype.handleIsyUpdate = function(actionValue) {
	var newFanState = this.FAN_OFF;
	if(actionValue == 0) {
		newFanState = this.FAN_OFF;
	} else if(actionValue == this.ISY_COMMAND_FAN_PARAMETER_LOW) {
		newFanState = this.FAN_LEVEL_LOW;
	} else if(actionValue == this.ISY_COMMAND_FAN_PARAMETER_MEDIUM) {
		newFanState = this.FAN_LEVEL_MEDIUM;
	} else if(actionValue == this.ISY_COMMAND_FAN_PARAMETER_HIGH) {
		newFanState = this.FAN_LEVEL_HIGH;
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
exports.ISYMotionSensorDevice = ISYMotionSensorDevice;
