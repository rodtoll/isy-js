var isy = require('./isy.js');
var xmldoc = require('xmldoc');
var isyConstants = require('./isyconstants.js');

/////////////////////////////
// ELKAlarmPanelDevice
//

function ELKAlarmPanelDevice(isy,area) {
	this.isy = isy;
	this.area = area;
	this.alarmTripState = isyConstants.ELK_ALARM_TRIP_STATE_DISARMED;
	this.alarmState = isyConstants.ELK_ALARM_STATE_NOT_READY_TO_ARM;
	this.alarmMode = isyConstants.ELK_ALARM_MODE_DISARMED;
	this.name = "Elk Alarm Panel "+area;
	this.address = "ElkPanel"+area;
	this.deviceFriendlyName = "Elk Main Alarm Panel";
	this.deviceType = isyConstants.DEVICE_TYPE_ALARM_PANEL;
	this.connectionType = "Elk Network Module";
	this.batteryOperated = false;	
	this.voltage = 71;
}

ELKAlarmPanelDevice.prototype.sendSetAlarmModeCommand = function(alarmState,handleResult) {
	if(alarmState == isyConstants.ISY_COMMAND_ELK_ALARM_MODE_DISARMED) {
		this.isy.sendISYCommand('elk/area/'+this.area+'/cmd/disarm',handleResult);		
	} else {
		this.isy.sendISYCommand('elk/area/'+this.area+'/cmd/arm?armType='+alarmState,handleResult);
	}
}

ELKAlarmPanelDevice.prototype.clearAllBypasses = function(handleResult) {
	this.isy.sendISYCommand('elk/area/'+this.area+'/cmd/unbypass',handleResult);		
}

ELKAlarmPanelDevice.prototype.getAlarmStatusAsText = function() {
	return "AM ["+this.alarmMode+"] AS ["+this.alarmState+"] ATS ["+this.alarmTripState+"]";
}

ELKAlarmPanelDevice.prototype.getAlarmTripState = function() {
	return this.alarmTripState;
}

ELKAlarmPanelDevice.prototype.getAlarmState = function() {
	return this.alarmState;
}

ELKAlarmPanelDevice.prototype.getAlarmMode = function() {
	return this.alarmMode;
}

ELKAlarmPanelDevice.prototype.setFromAreaUpdate = function(areaUpdate) {
	var areaId = areaUpdate.attr.area;
	var updateType = areaUpdate.attr.type;
	var valueToSet = areaUpdate.attr.val;
	var valueChanged = false;
	
	if(areaId == this.area) {
		if(updateType == 1) {
			if(this.alarmTripState != valueToSet) {
				this.alarmTripState = valueToSet;
				valueChanged = true;
			}
		} else if(updateType == 2) {
			if(this.alarmState != valueToSet) {
				this.alarmState = valueToSet;
				valueChanged = true;
			}
		} else if(updateType == 3){
			if(this.alarmMode != valueToSet) {
				this.alarmMode = valueToSet;
				valueChanged = true;
			}
		}
	}	
	return valueChanged;
}

/////////////////////////////
// ELKAlarmSensor
//
function ElkAlarmSensor(isy,name,area,zone) {
	this.isy = isy;
	this.area = area;
	this.zone = zone;
	this.name = name;
	this.address = "ElkZone"+zone;
	this.deviceFriendlyName = "Elk Connected Sensor";
	this.deviceType = isyConstants.DEVICE_TYPE_ALARM_DOOR_WINDOW_SENSOR;
	this.connectionType = "Elk Network";
	this.batteryOperated = false;	
	this.physicalState = isyConstants.ELK_SENSOR_STATE_PHYSICAL_NOT_CONFIGURED;
	this.logicalState = isyConstants.ELK_SENSOR_STATE_LOGICAL_NORMAL;
}

ElkAlarmSensor.prototype.sendBypassToggleCommand = function(handleResult) {
	this.isy.sendISYCommand('elk/zone/'+this.zone+'/cmd/toggle/bypass',handleResult);		
}

ElkAlarmSensor.prototype.getPhysicalState = function() {
	return this.physicalState;
}

ElkAlarmSensor.prototype.getLogicalState = function() {
	return this.logicalState;
}

ElkAlarmSensor.prototype.getCurrentDoorWindowState = function() {
	return (this.physicalState == isyConstants.ELK_SENSOR_STATE_PHYSICAL_OPEN || this.logicalState == isyConstants.ELK_SENSOR_STATE_LOGICAL_VIOLATED );
}

ElkAlarmSensor.prototype.getSensorStatus = function() {
	return "PS ["+this.physicalState+"] LS ["+this.logicatState+"]";
}

ElkAlarmSensor.prototype.isPresent = function() {
	if(this.voltage < 65 || this.voltage > 80) {
		return true;
	} else {
		return false;
	}
}

ElkAlarmSensor.prototype.setFromZoneUpdate = function(zoneUpdate) {
	var zone = zoneUpdate.attr.zone;
	var updateType = zoneUpdate.attr.type;
	var valueToSet = zoneUpdate.attr.val;
	var valueChanged = false;
	
	if(zone == this.zone) {
		if(updateType == 51) {
			if(this.logicalState != valueToSet) {
				this.logicalState = valueToSet;
				// Not triggering change update on logical state because physical always follows and don't want double notify.
				// valueChanged = true;
			}
		} else if(updateType == 52) {
			if(this.physicalState != valueToSet) {
				this.physicalState = valueToSet;
				valueChanged = true;
			}
		} else if(updateType == 53) {
			if(this.voltage != valueToSet) {
				this.voltage = valueToSet;
				valueChanged = true;
			}
		}
	}	
	return valueChanged;
}

exports.ELKAlarmPanelDevice = ELKAlarmPanelDevice;
exports.ElkAlarmSensor = ElkAlarmSensor;





