var ISY = require('./isy');
var ISYDevice = require('./isydevice');

function handleInitialized() {
	var deviceList = isy.getDeviceList();
	if(deviceList == null) {
		ISY.debugLog("No device list returned!");
	} else {
		ISY.debugLog("Got device list. Device count: "+deviceList.length);
		for(var index = 0; index < deviceList.length; index++ ) {
			ISY.debugLog("Device: "+deviceList[index].name+", "+deviceList[index].deviceType+", "+deviceList[index].address+", "+deviceList[index].deviceFriendlyName);
		}
	}
    runBasicSceneTest(deviceList);
}

function handleChanged(isy, device) {
	var logMessage = 'From isy: '+isy.address+' device changed: '+device.name;
	if(device.deviceType == isy.DEVICE_TYPE_FAN) {
		logMessage += ' fan state: '+device.getCurrentFanState();
	} else if(device.deviceType == isy.DEVICE_TYPE_LIGHT) {
		logMessage += ' light state: '+device.getCurrentLightState();
	} else if(device.deviceType == isy.DEVICE_TYPE_DIMMABLE_LIGHT) {
		logMessage += ' dimmable light state: '+device.getCurrentLightState()+' dimm Level: '+device.getCurrentLightDimState();
	} else if(device.deviceType == isy.DEVICE_TYPE_LOCK || device.deviceType == isy.DEVICE_TYPE_SECURE_LOCK) {
		logMessage += ' lock state: '+device.getCurrentLockState();
	} else if(device.deviceType == isy.DEVICE_TYPE_OUTLET) {
		logMessage += ' outlet state: '+device.getCurrentOutletState();
	} else if(device.deviceType == isy.DEVICE_TYPE_ALARM_DOOR_WINDOW_SENSOR) {
		logMessage += ' door window sensor state: '+device.getCurrentDoorWindowState()+' logical: '+device.getLogicalState()+' physical: '+device.getPhysicalState();		
	} else if(device.deviceType == isy.DEVICE_TYPE_DOOR_WINDOW_SENSOR) {
		logMessage += ' door window sensor state: '+device.getCurrentDoorWindowState();
	} else if(device.deviceType == isy.DEVICE_TYPE_ALARM_PANEL) {
		logMessage += ' alarm panel state: '+device.getAlarmStatusAsText();
	} else if(device.deviceType == isy.DEVICE_TYPE_MOTION_SENSOR) {
		logMessage += ' motion sensor state: '+device.getCurrentMotionSensorState();        
	} else if(device.deviceType == isy.DEVICE_TYPE_SCENE) {
		logMessage += ' scene. light state: '+device.getCurrentLightState()+' dimm Level: '+device.getCurrentLightDimState();
    } else {
		logMessage += ' unknown device, cannot parse state';
	}

    console.log(logMessage);	
    ISY.debugLog(logMessage);
}

//var isy = new ISY.ISY('10.0.1.19', 'admin', 'Password', true, handleChanged, false, true);
var isy = new ISY.ISY('127.0.0.1:3000', 'admin', 'password', true, handleChanged, false, true);

isy.initialize(handleInitialized);

function runBasicSceneTest(devices) {
    for(var index = 0; index < devices.length; index++) {
        var device = devices[index];
        if(device.deviceType == isy.DEVICE_TYPE_SCENE && device.childDevices.length > 0 && device.childDevices.length < 5) {
            console.log('Using scene: '+device.name);
            console.log('Contains devices: ');
            for(var childIndex = 0; childIndex < device.childDevices.length; childIndex++) {
                console.log('Device: name='+device.childDevices[childIndex].name+' type='+device.childDevices[childIndex].deviceType);
            }
            console.log('Light state: '+devices[index].getCurrentLightState());
            device.sendLightCommand(true, function() {      
                console.log('Turned them off to start so we make sure to get an on');      
                device.sendLightCommand(true, function() {
                    console.log('SHould have seen them all turn on');
                    device.sendLightCommand(false, function() {
                        console.log('Should have seen them all turn off');
                        device.sendLightDimCommand(50, function() {
                            console.log('Should have seen them all set to 50%');
                            device.sendLightCommand(false, function() {});
                        });
                    });
                });
            });
            break;
        }
    }
}
