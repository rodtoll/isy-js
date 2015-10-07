var ISY = require('./isy');
var ISYDevice = require('./isydevice');
var isyConstants = require('./isyconstants.js');

function handleInitialized() {
	var deviceList = isy.getDeviceList();
	if(deviceList == null) {
		console.log("No device list returned!");
	} else {
		console.log("Got device list. Device count: "+deviceList.length);
		for(var index = 0; index < deviceList.length; index++ ) {
			console.log("Device: "+deviceList[index].name+", "+deviceList[index].deviceType+", "+deviceList[index].address+", "+deviceList[index].deviceFriendlyName);
		}
	}
}

function handleChanged(isy, device) {
	var logMessage = 'From isy: '+isy.address+' device changed: '+device.name;
	if(device.deviceType == isyConstants.DEVICE_TYPE_FAN) {
		logMessage += ' fan state: '+device.getCurrentFanState();
	} else if(device.deviceType == isyConstants.DEVICE_TYPE_LIGHT) {
		logMessage += ' light state: '+device.getCurrentLightState();
	} else if(device.deviceType == isyConstants.DEVICE_TYPE_DIMMABLE_LIGHT) {
		logMessage += ' dimmable light state: '+device.getCurrentLightState()+' dimm Level: '+device.getCurrentLightDimState();
	} else if(device.deviceType == isyConstants.DEVICE_TYPE_LOCK || device.deviceType == isyConstants.DEVICE_TYPE_SECURE_LOCK) {
		logMessage += ' lock state: '+device.getCurrentLockState();
	} else if(device.deviceType == isyConstants.DEVICE_TYPE_OUTLET) {
		logMessage += ' outlet state: '+device.getCurrentOutletState();
	} else if(device.deviceType == isyConstants.DEVICE_TYPE_ALARM_DOOR_WINDOW_SENSOR) {
		logMessage += ' door window sensor state: '+device.getCurrentDoorWindowState()+' logical: '+device.getLogicalState()+' physical: '+device.getPhysicalState();		
	} else if(device.deviceType == isyConstants.DEVICE_TYPE_DOOR_WINDOW_SENSOR) {
		logMessage += ' door window sensor state: '+device.getCurrentDoorWindowState();
	} else if(device.deviceType == isyConstants.DEVICE_TYPE_ALARM_PANEL) {
		logMessage += ' alarm panel state: '+device.getAlarmStatusAsText();
	} else {
		logMessage += ' unknown device, cannot parse state';
	}
	
    console.log(logMessage);
}

var isy = new ISY.ISY('10.0.1.19', 'admin', 'ErgoFlat91', true, handleChanged);
var devices = isy.initialize(handleInitialized);


