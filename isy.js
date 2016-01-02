var restler = require('restler');
var xmldoc = require('xmldoc');
var isyDevice = require('./isydevice');
var WebSocket = require("faye-websocket");
var elkDevice = require('./elkdevice.js');
var isyDeviceTypeList = require("./isydevicetypes.json");
var ISYOutletDevice = require('./isydevice').ISYOutletDevice;
var ISYLightDevice = require('./isydevice').ISYLightDevice;
var ISYLockDevice = require('./isydevice').ISYLockDevice;
var ISYDoorWindowDevice = require('./isydevice').ISYDoorWindowDevice;
var ISYFanDevice = require('./isydevice').ISYFanDevice;
var ISYMotionSensorDevice = require('./isydevice').ISYMotionSensorDevice;
var ISYScene = require('./isyscene').ISYScene;

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

function debugLog(message) {
    if(process.env.ISYJSDEBUG != undefined && process.env.ISYJSDEBUG != null) {
        console.log("ISY-JS: "+message);
    }
}

var ISY = function(address, username, password, elkEnabled, changeCallback, useHttps, scenesInDeviceList) {
    this.address  = address;
    this.userName = username;
    this.password = password;
    this.deviceIndex = {};
    this.deviceList = [];
    this.nodesLoaded = false;
    this.protocol = (useHttps == true) ? 'https' : 'http';
    this.elkEnabled = elkEnabled;
    this.zoneMap = {};
    this.sceneList = [];
    this.sceneIndex = {};
    this.scenesInDeviceList = (scenesInDeviceList==undefined) ? false : scenesInDeviceList;
    if(this.elkEnabled) {
        this.elkAlarmPanel = new elkDevice.ELKAlarmPanelDevice(this,1);
    }
    this.changeCallback = changeCallback;
};

ISY.prototype.DEVICE_TYPE_LOCK = 'DoorLock';
ISY.prototype.DEVICE_TYPE_SECURE_LOCK = 'SecureLock';
ISY.prototype.DEVICE_TYPE_LIGHT = 'Light';
ISY.prototype.DEVICE_TYPE_DIMMABLE_LIGHT = 'DimmableLight';
ISY.prototype.DEVICE_TYPE_OUTLET = 'Outlet';
ISY.prototype.DEVICE_TYPE_FAN = 'Fan';
ISY.prototype.DEVICE_TYPE_UNKNOWN = 'Unknown';
ISY.prototype.DEVICE_TYPE_DOOR_WINDOW_SENSOR = "DoorWindowSensor";
ISY.prototype.DEVICE_TYPE_ALARM_DOOR_WINDOW_SENSOR = 'AlarmDoorWindowSensor'
ISY.prototype.DEVICE_TYPE_CO_SENSOR = 'COSensor';
ISY.prototype.DEVICE_TYPE_ALARM_PANEL = 'AlarmPanel';
ISY.prototype.DEVICE_TYPE_MOTION_SENSOR = 'MotionSensor';
ISY.prototype.DEVICE_TYPE_SCENE = 'Scene';

ISY.prototype.buildDeviceInfoRecord = function(isyType, deviceFamily, deviceType) {
    return {
        type: isyType,
        address: "",
        name: "Generic Device",
        deviceType: deviceType,
        connectionType: deviceFamily,
        batteryOperated: false
    };
}

ISY.prototype.getDeviceTypeBasedOnISYTable = function(deviceNode) {
    var familyId = 1;
    if(deviceNode.childNamed('family') != null) {
        familyId = Number(deviceNode.childNamed('family').val);
    }
    var isyType = deviceNode.childNamed('type').val;
    var addressData = deviceNode.childNamed('address').val
    var addressElements = addressData.split(' ');
    var typeElements = isyType.split('.');
    var mainType = Number(typeElements[0]);
    var subType = Number(typeElements[1]);
    var subAddress = Number(addressElements[3]);
    // ZWave nodes identify themselves with devtype node
    if(deviceNode.childNamed('devtype') != null) {
        if(deviceNode.childNamed('devtype').childNamed('cat') != null) {
            subType = Number(deviceNode.childNamed('devtype').childNamed('cat').val);
        }
    }    
    // Insteon Device Family    
    if(familyId == 1) {

        // Dimmable Devices
        if(mainType == 1) {
            // Special case fanlinc has a fan element
            if(subType == 46 && subAddress == 2) {
                return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_FAN);
            } else {
                return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_DIMMABLE_LIGHT); 
            }
        } else if(mainType == 2) {
            // Special case appliance Lincs into outlets
            if(subType == 6 || subType == 9 || subType == 12 || subType == 23) {
                return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_OUTLET); 
            // Outlet lincs 
            } else if(subType == 8 || subType == 33) {
                return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_OUTLET);                 
            // Dual outlets    
            } else if(subType == 57) {
                return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_OUTLET);                 
            } else {
                return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_LIGHT);                 
            }
        // Sensors
        } else if(mainType == 7) {
            // I/O Lincs
            if(subType == 0) {
                if(subAddress == 1) {
                    return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_DOOR_WINDOW_SENSOR);                     
                } else {
                    return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_OUTLET);                                     
                }
            // Other sensors. Not yet supported
            } else {
                return null;
            }
        // Access controls/doors/locks
        } else if(mainType == 15) {
            // MorningLinc
            if(subType == 6) {
                if(subAddress == 1) {
                    return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_LOCK);
                // Ignore subdevice which operates opposite for the locks 
                } else {
                    return null;
                }                                   
            // Other devices, going to guess they are similar to MorningLinc
            } else {
                return null;
            }
        } else if(mainType == 16) {
            // Motion sensors
            if(subType == 1 || subType == 3) {
                if(subAddress == 1) {
                    return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_MOTION_SENSOR);                                                     
                // Ignore battery level sensor and daylight sensor
                } else {
                    
                }
            } else if(subType == 2 || subType == 9 || subType == 17) {
                return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_DOOR_WINDOW_SENSOR);                                                                     
            // Smoke, leak sensors, don't yet know how to support
            } else {
                return null;
            }
        // No idea how to test or support
        } else {
            return null;
        }
    // Z-Wave Device Family
    } else if(familyId == 4) {
        // Appears to be all ZWave devices seen so far
        if(mainType == 4) {
            // Identified by user zwave on/off switch
            if(subType == 16) {
                return this.buildDeviceInfoRecord(isyType, "ZWave", this.DEVICE_TYPE_LIGHT);                                                                     
            // Identified by user door lock
            } else if(subType == 111) {
                return this.buildDeviceInfoRecord(isyType, "ZWave", this.DEVICE_TYPE_SECURE_LOCK);                                                                                     
            // This is a guess based on the naming in the ISY SDK
            } else if(subType == 109) {
                return this.buildDeviceInfoRecord(isyType, "ZWave", this.DEVICE_TYPE_DIMMABLE_LIGHT);                                                                                                     
            // Otherwise we don't know how to handle
            } else {
                return null;
            }
        }
    } 
    return null;
}

ISY.prototype.nodeChangedHandler = function(node) {
    var that = this;
    if(this.nodesLoaded) {
        debugLog('Node: '+node.address+' changed');
        this.changeCallback(that, node);
    }
}

ISY.prototype.getElkAlarmPanel = function() {
    return this.elkAlarmPanel;
}

ISY.prototype.loadNodes = function(result) {
    var document = new xmldoc.XmlDocument(result);
    this.loadDevices(document);
    this.loadScenes(document);
}

ISY.prototype.loadScenes = function(document) {
    var nodes = document.childrenNamed('group');
    for(var index = 0; index < nodes.length; index++) {
        var sceneAddress = nodes[index].childNamed('address').val;
        var sceneName = nodes[index].childNamed('name').val;
        var linkNodes = nodes[index].childNamed('members').childrenNamed('link');
        var childDevices = [];
        for(var linkIndex = 0; linkIndex < linkNodes.length; linkIndex++) {
            var linkDevice = this.deviceIndex[linkNodes[linkIndex].val];
            if(linkDevice != null && linkDevice != undefined) {
                childDevices.push(linkDevice);
            }
        }
        var newScene = new ISYScene(this, sceneName, sceneAddress, childDevices);
        this.sceneList.push(newScene);
        this.sceneIndex[newScene.address] = newScene;
        if(this.scenesInDeviceList) {
            this.deviceIndex[newScene.address] = newScene;
            this.deviceList.push(newScene);
        }
    }
}

ISY.prototype.loadDevices = function(document) {
    var nodes = document.childrenNamed('node');
    for(var index = 0; index < nodes.length; index++) {
        var deviceAddress = nodes[index].childNamed('address').val;
        var isyDeviceType = nodes[index].childNamed('type').val;
        var deviceName = nodes[index].childNamed('name').val;
        var newDevice = null;
        var deviceTypeInfo = isyTypeToTypeName(isyDeviceType, deviceAddress);
        var enabled = nodes[index].childNamed('enabled').val;
        
        if(enabled !== 'false') {  
            // Try fallback to new generic device identification when not specifically identified.  
            if(deviceTypeInfo == null) {    
                deviceTypeInfo = this.getDeviceTypeBasedOnISYTable(nodes[index]);
            }
            if(deviceTypeInfo != null) {
                if(deviceTypeInfo.deviceType == this.DEVICE_TYPE_DIMMABLE_LIGHT ||
                deviceTypeInfo.deviceType == this.DEVICE_TYPE_LIGHT) {
                newDevice = new ISYLightDevice(
                    this,
                    deviceName,
                    deviceAddress,
                    deviceTypeInfo
                )        
                } else if(deviceTypeInfo.deviceType == this.DEVICE_TYPE_DOOR_WINDOW_SENSOR) {
                    newDevice = new ISYDoorWindowDevice(
                        this,
                        deviceName,
                        deviceAddress,
                        deviceTypeInfo
                    );
                } else if(deviceTypeInfo.deviceType == this.DEVICE_TYPE_MOTION_SENSOR) {
                    newDevice = new ISYMotionSensorDevice(
                        this,
                        deviceName,
                        deviceAddress,
                        deviceTypeInfo
                    );                
                } else if(deviceTypeInfo.deviceType == this.DEVICE_TYPE_FAN) {
                    newDevice = new ISYFanDevice(
                        this,
                        deviceName,
                        deviceAddress,
                        deviceTypeInfo
                    );
                } else if(deviceTypeInfo.deviceType == this.DEVICE_TYPE_LOCK || 
                        deviceTypeInfo.deviceType == this.DEVICE_TYPE_SECURE_LOCK) {
                    newDevice = new ISYLockDevice(
                        this,
                        deviceName,
                        deviceAddress,
                        deviceTypeInfo
                    );
                } else if(deviceTypeInfo.deviceType == this.DEVICE_TYPE_OUTLET) {
                    newDevice = new ISYOutletDevice(
                        this,
                        deviceName,
                        deviceAddress,
                        deviceTypeInfo
                    );
                } 
                if(newDevice != null) {
                    this.deviceIndex[deviceAddress] = newDevice;
                    this.deviceList.push(newDevice);
                    if(nodes[index].childNamed('property') != null) {
                        this.handleISYStateUpdate(deviceAddress, nodes[index].childNamed('property').attr.value);
                    }
                }
            }
        } else {
            debugLog('Ignoring disabled device: '+deviceName);
        }
    }      
}

ISY.prototype.loadElkNodes = function(result) {
    var document = new xmldoc.XmlDocument(result);
    var nodes = document.childNamed('areas').childNamed('area').childrenNamed('zone');
    for(var index = 0; index < nodes.length; index++) {
        var id = nodes[index].attr.id;
        var name = nodes[index].attr.name;
        var alarmDef = nodes[index].attr.alarmDef;
        
        var newDevice = new elkDevice.ElkAlarmSensor(
            this,
            name,
            1,
            id,
            (alarmDef==17) ? this.DEVICE_TYPE_CO_SENSOR : this.DEVICE_TYPE_ALARM_DOOR_WINDOW_SENSOR);
        this.zoneMap[newDevice.zone] = newDevice;
    }     
}

ISY.prototype.loadElkInitialStatus = function(result) {
    var document = new xmldoc.XmlDocument(result);
    var nodes = document.childrenNamed('ae');
    for(var index = 0; index < nodes.length; index++) {
        this.elkAlarmPanel.setFromAreaUpdate(nodes[index]);
    }        
    nodes = document.childrenNamed('ze');
    for(var index = 0; index < nodes.length; index++) {
        var id = nodes[index].attr.zone;
        var zoneDevice = this.zoneMap[id];
        if(zoneDevice != null) {
            zoneDevice.setFromZoneUpdate(nodes[index]);
            if(this.deviceIndex[zoneDevice.address] == null && zoneDevice.isPresent()) {
                this.deviceList.push(zoneDevice);        
                this.deviceIndex[zoneDevice.address] = zoneDevice;
            }
        }
    }
}

ISY.prototype.finishInitialize = function(success, initializeCompleted) {
    this.nodesLoaded = true;
    initializeCompleted();
    if(success) {
        if(this.elkEnabled) {
            this.deviceList.push(this.elkAlarmPanel);            
        }
        this.initializeWebSocket(); 
    }  
}

ISY.prototype.initialize = function(initializeCompleted) {
    
    var that = this;
    
    var options = {
        username: this.userName,
        password: this.password
    }

    restler.get(
        this.protocol+'://'+this.address+'/rest/nodes',
        options
    ).on('complete', function(result, response) {
        if(response instanceof Error || response.statusCode != 200) {
            debugLog('Error:'+result.message);
            throw new Error("Unable to contact the ISY to get the list of nodes");
        } else {
            that.loadNodes(result);
            if(that.elkEnabled) {
                restler.get(
                    that.protocol+'://'+that.address+'/rest/elk/get/topology',
                    options
                ).on('complete', function(result, response) {
                    if(response instanceof Error || response.statusCode != 200) {
                        debugLog('Error loading from elk: '+result.message);
                        throw new Error("Unable to contact the ELK to get the topology");
                    } else {
                        that.loadElkNodes(result);
                        restler.get(
                            that.protocol+'://'+that.address+'/rest/elk/get/status',
                            options
                        ).on('complete', function(result, response) {
                            if(response instanceof Error || response.statusCode != 200) {
                                debugLog('Error:'+result.message);
                                throw new Error("Unable to get the status from the elk");
                            } else {
                                that.loadElkInitialStatus(result);
                                that.finishInitialize(true,initializeCompleted);                                                        
                            }
                        });
                    }
                });                 
            } else {
                that.finishInitialize(true,initializeCompleted);                    
            }
        } 
    }).on('error', function(err,response) {
        debugLog("Error while contacting ISY"+err);
        throw new Error("Error calling ISY"+err);
    }).on('fail', function(data,response) {
        debugLog("Error while contacting ISY -- failure");
        throw new Error("Failed calling ISY");
    }).on('abort', function() {
        debugLog("Abort while contacting ISY");
        throw new Error("Call to ISY was aborted");
    }).on('timeout', function(ms) {
        debugLog("Timed out contacting ISY");
        throw new Error("Timeout contacting ISY");
    });
}

ISY.prototype.handleWebSocketMessage = function(event) {
    var document = new xmldoc.XmlDocument(event.data);  
    if(document.childNamed('control') != null) {
        var controlElement = document.childNamed('control').val;
        var actionValue = document.childNamed('action').val;
        var address = document.childNamed('node').val;
        if(controlElement == 'ST') {
            this.handleISYStateUpdate(address, actionValue);
        } else if(controlElement == '_19') {
            if(actionValue == 2) {
                var aeElement = document.childNamed('eventInfo').childNamed('ae');
                if(aeElement != null) {
                    if(this.elkAlarmPanel.setFromAreaUpdate(aeElement)) {
                        this.nodeChangedHandler(this.elkAlarmPanel);
                    }
                }
            } else if(actionValue == 3) {
                var zeElement = document.childNamed('eventInfo').childNamed('ze');
                var zoneId = zeElement.attr.zone;
                var zoneDevice = this.zoneMap[zoneId];
                if(zoneDevice != null) {
                    if(zoneDevice.setFromZoneUpdate(zeElement)) {
                        this.nodeChangedHandler(zoneDevice);
                    }
                }
            }            
        }
    }
}

ISY.prototype.initializeWebSocket = function() {
    var that = this;
    var auth = 'Basic ' + new Buffer(this.userName + ':' + this.password).toString('base64');

    this.webSocket = new WebSocket.Client(
	   "ws://"+this.address+"/rest/subscribe", 
	   ["ISYSUB"],
	   {
		  headers: {
		  	   "Origin": "com.universal-devices.websockets.isy",
			 "Authorization": auth			
		  }
	   });
	
    this.webSocket.on('message', function(event) {
        that.handleWebSocketMessage(event);
    });
}

ISY.prototype.getDeviceList = function() {
    return this.deviceList;
}

ISY.prototype.getDevice = function(address) {
    return this.deviceIndex[address];
}

ISY.prototype.getScene = function(address) {
    return this.sceneIndex[address];
}

ISY.prototype.getSceneList = function() {
    return this.sceneList;
}

ISY.prototype.handleISYStateUpdate = function(address, state) {
    var deviceToUpdate = this.deviceIndex[address];
    if(deviceToUpdate != undefined && deviceToUpdate != null) {
        if(deviceToUpdate.handleIsyUpdate(state)) {
            this.nodeChangedHandler(deviceToUpdate);
            if(this.scenesInDeviceList) {
                // Inefficient, we could build a reverse index (device->scene list)
                // but device list is relatively small
                for(var index = 0; index < this.sceneList.length; index++) {
                    if(this.sceneList[index].isDeviceIncluded(deviceToUpdate)) {
                        this.nodeChangedHandler(this.sceneList[index]);
                    }
                }            
            }
        }
    }

}

ISY.prototype.sendISYCommand = function(path, handleResult) {
    var uriToUse = this.protocol+'://'+this.address+'/rest/'+path;
    debugLog("Sending ISY command..."+uriToUse);
    var options = {
        username: this.userName,
        password: this.password
    }    
    restler.get(uriToUse, options).on('complete', function(data, response) {
        if(response.statusCode == 200) {
            handleResult(true);
        } else {
            handleResult(false);
        }
    });    
}

ISY.prototype.sendRestCommand = function(deviceAddress, command, parameter, handleResult) {
    var uriToUse = this.protocol+'://'+this.address+'/rest/nodes/'+deviceAddress+'/cmd/'+command;
    if(parameter != null) {
        uriToUse += '/' + parameter;
    }
    debugLog("Sending command..."+uriToUse);
    var options = {
        username: this.userName,
        password: this.password
    }    
    restler.get(uriToUse, options).on('complete', function(data, response) {
        if(response.statusCode == 200) {
            handleResult(true);
        } else {
            handleResult(false);
        }
    });
}

exports.ISY = ISY;
exports.debugLog = debugLog;
