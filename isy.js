var restler = require('restler');
var xmldoc = require('xmldoc');
var isyDevice = require('./isydevice');
var WebSocket = require("faye-websocket");
var elkDevice = require('./elkdevice.js');
var isyDeviceTypeList = require("./isydevicetypes.json");

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

var ISY = function(address, username, password, elkEnabled, changeCallback, useHttps) {
    this.address  = address;
    this.userName = username;
    this.password = password;
    this.deviceIndex = {};
    this.deviceList = [];
    this.nodesLoaded = false;
    this.protocol = (useHttps == true) ? 'https' : 'http';
    this.elkEnabled = elkEnabled;
    this.zoneMap = {};
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
    var nodes = document.childrenNamed('node');
    for(var index = 0; index < nodes.length; index++) {
		var enabled = nodes[index].childNamed('enabled').val;
		if (enabled !== 'false') {
			var deviceAddress = nodes[index].childNamed('address').val;
			var isyDeviceType = nodes[index].childNamed('type').val;
			var deviceName = nodes[index].childNamed('name').val;
			var newDevice = null;
			var deviceTypeInfo = isyTypeToTypeName(isyDeviceType, deviceAddress);

			if(deviceTypeInfo != null) {
				if(deviceTypeInfo.deviceType == this.DEVICE_TYPE_DIMMABLE_LIGHT ||
				deviceTypeInfo.deviceType == this.DEVICE_TYPE_LIGHT) {
				newDevice = new isyDevice.ISYLightDevice(
					this,
					deviceName,
					deviceAddress,
					deviceTypeInfo
				)        
				} else if(deviceTypeInfo.deviceType == this.DEVICE_TYPE_DOOR_WINDOW_SENSOR) {
					newDevice = new isyDevice.ISYDoorWindowDevice(
						this,
						deviceName,
						deviceAddress,
						deviceTypeInfo
					);
				} else if(deviceTypeInfo.deviceType == this.DEVICE_TYPE_MOTION_SENSOR) {
					newDevice = new isyDevice.ISYMotionSensorDevice(
						this,
						deviceName,
						deviceAddress,
						deviceTypeInfo
					);                
				} else if(deviceTypeInfo.deviceType == this.DEVICE_TYPE_FAN) {
					newDevice = new isyDevice.ISYFanDevice(
						this,
						deviceName,
						deviceAddress,
						deviceTypeInfo
					);
				} else if(deviceTypeInfo.deviceType == this.DEVICE_TYPE_LOCK || 
						deviceTypeInfo.deviceType == this.DEVICE_TYPE_SECURE_LOCK) {
					newDevice = new isyDevice.ISYLockDevice(
						this,
						deviceName,
						deviceAddress,
						deviceTypeInfo
					);
				} else if(deviceTypeInfo.deviceType == this.DEVICE_TYPE_OUTLET) {
					newDevice = new isyDevice.ISYOutletDevice(
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

ISY.prototype.handleISYStateUpdate = function(address, state) {
    var deviceToUpdate = this.deviceIndex[address];
    if(deviceToUpdate != undefined && deviceToUpdate != null) {
        if(deviceToUpdate.handleIsyUpdate(state)) {
            this.nodeChangedHandler(deviceToUpdate);
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
