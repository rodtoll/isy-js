var restler = require('restler');
var xmldoc = require('xmldoc');
var isyDevice = require('./isydevice');
var isyConstants = require('./isyconstants.js');
var WebSocket = require("faye-websocket");

var ISY = function(address, username, password, changeCallback) {
    this.address  = address;
    this.userName = username;
    this.password = password;
    this.deviceIndex = {};
    this.deviceList = [];
    this.nodesLoaded = false;
    this.changeCallback = changeCallback;
};

ISY.prototype.nodeChangedHandler = function(node) {
    var that = this;
    if(this.nodesLoaded) {
        console.log('Node: '+node.address+' changed');
        this.changeCallback(that, node);
    }
}

ISY.prototype.initialize = function(initializeCompleted) {
    
    var that = this;
    
    var options = {
        username: this.userName,
        password: this.password
    }
    
    restler.get(
        'http://'+this.address+'/rest/nodes',
        options
    ).on('complete', function(result, response) {
        if(response instanceof Error) {
            console.log('Error:'+result.message);
            this.nodesLoaded = true;
            initializeCompleted();
        } else {
            var document = new xmldoc.XmlDocument(result);
            var nodes = document.childrenNamed('node');
            for(var index = 0; index < nodes.length; index++) {
                var deviceAddress = nodes[index].childNamed('address').val;
                var newDevice = new isyDevice.ISYDevice(
                    that,
                    nodes[index].childNamed('name').val,
                    deviceAddress,
                    nodes[index].childNamed('type').val
                );
                if(newDevice.deviceType != isyConstants.DEVICE_TYPE_UNKNOWN) {
                    that.deviceIndex[deviceAddress] = newDevice;
                    that.deviceList.push(newDevice);
                    if(nodes[index].childNamed('property') != null) {
                        that.handleISYStateUpdate(deviceAddress, nodes[index].childNamed('property').attr.value);
                    }
                }
            }      
            that.nodesLoaded = true;
            initializeCompleted();
            that.initializeWebSocket();
        } 
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
        if(deviceToUpdate.deviceType == isyConstants.DEVICE_TYPE_LIGHT) {
            deviceToUpdate.setCurrentLightDimLevel(Math.floor(100 * state / 255));
            if(state > 0) {
                deviceToUpdate.setCurrentLightState(true);
            } else {
                deviceToUpdate.setCurrentLightState(false);
            }
        } else if(deviceToUpdate.deviceType == isyConstants.DEVICE_TYPE_OUTLET) {
            if(state > 0) {
                deviceToUpdate.setCurrentOutletState(true);
            } else {
                deviceToUpdate.setCurrentOutletState(false);
            }
        } else if(deviceToUpdate.deviceType == isyConstants.DEVICE_TYPE_SECURE_LOCK) {
            if(state > 0) {
                deviceToUpdate.setCurrentLockState(true);
            } else {
                deviceToUpdate.setCurrentLockState(false);
            }
        } else if(deviceToUpdate.deviceType == isyConstants.DEVICE_TYPE_LOCK) {
            if(state == isyConstants.ISY_STATE_LOCK_UNLOCKED) {
                deviceToUpdate.setCurrentLockState(false);
            } else {
                deviceToUpdate.setCurrentLockState(true);
            }
        } else if(deviceToUpdate.deviceType == isyConstants.DEVICE_TYPE_DOOR_WINDOW_SENSOR) {
            if(state == isyConstants.ISY_STATE_DOOR_WINDOW_CLOSED) {
                deviceToUpdate.setCurrentDoorWindowState(false);
            } else {
                deviceToUpdate.setCurrentDoorWindowState(true);
            }
        } else if(deviceToUpdate.deviceType == isyConstants.DEVICE_TYPE_FAN) {
            if(state > 0 && state <= isyConstants.ISY_COMMAND_FAN_PARAMETER_LOW) {
                deviceToUpdate.setCurrentFanState(isyConstants.USER_COMMAND_FAN_LOW);
            } else if(state > isyConstants.ISY_COMMAND_FAN_PARAMETER_LOW && state <= isyConstants.ISY_COMMAND_FAN_PARAMETER_MEDIUM) {
                deviceToUpdate.setCurrentFanState(isyConstants.USER_COMMAND_FAN_MEDIUM);
            } else if(state == 0) {
                deviceToUpdate.setCurrentFanState(isyConstants.USER_COMMAND_FAN_OFF);
            } else {
                deviceToUpdate.setCurrentFanState(isyConstants.USER_COMMAND_FAN_HIGH);
            }
        }
    }
}

ISY.prototype.sendRestCommand = function(address, command, parameter) {
    var uriToUse = 'http://'+this.address+'/rest/nodes/'+address+'/cmd/'+command;
    if(parameter != null) {
        uriToUse += '/' + parameter;
    }
    console.log("Sending command..."+uriToUse);
    var options = {
        username: this.userName,
        password: this.password
    }    
    restler.get(uriToUse, options);
}

ISY.prototype.sendCommand = function(device, command) {
    if(!(device instanceof isyDevice.ISYDevice)) {
        console.log("Attempted to send command on non device");
        return;
    }
    
    if(device.deviceType == isyConstants.DEVICE_TYPE_LIGHT) {
        if(command == isyConstants.USER_COMMAND_LIGHT_ON || command == 100) {
            this.sendRestCommand(device.address,isyConstants.ISY_COMMAND_LIGHT_ON,null);            
        } else if(command == isyConstants.USER_COMMAND_LIGHT_OFF || command == 0){
            this.sendRestCommand(device.address,isyConstants.ISY_COMMAND_LIGHT_OFF,null);
        } else if(command > 0 && command < 100) {
            this.sendRestCommand(device.address,isyConstants.ISY_COMMAND_LIGHT_ON,Math.floor(command*255/100));
        } else {
            console.error('Unknown command: '+command+' for device '+device.name);
        }
    } else if(device.deviceType == isyConstants.DEVICE_TYPE_OUTLET) {
        if(command == isyConstants.USER_COMMAND_OUTLET_ON) {
            this.sendRestCommand(device.address,isyConstants.ISY_COMMAND_OUTLET_ON,null);            
        } else if(command == isyConstants.USER_COMMAND_OUTLET_OFF) {
            this.sendRestCommand(device.address,isyConstants.ISY_COMMAND_OUTLET_OFF,null);
        } else {
            console.error('Unknown command: '+command+' for device '+device.name);
        }     
    } else if(device.deviceType == isyConstants.DEVICE_TYPE_SECURE_LOCK) {
        if(command == isyConstants.USER_COMMAND_LOCK_LOCK) {
            this.sendRestCommand(device.address,isyConstants.ISY_COMMAND_SECURE_LOCK_BASE,isyConstants.ISY_COMMAND_SECURE_LOCK_PARAMETER_LOCK);            
        } else if(command == isyConstants.USER_COMMAND_LOCK_UNLOCK) {
            this.sendRestCommand(device.address,isyConstants.ISY_COMMAND_SECURE_LOCK_BASE,isyConstants.ISY_COMMAND_SECURE_LOCK_PARAMETER_UNLOCK);
        } else {
            console.error('Unknown command: '+command+' for device '+device.name);
        }  
    } else if(device.deviceType == isyConstants.DEVICE_TYPE_LOCK) {
        if(command == isyConstants.USER_COMMAND_LOCK_LOCK) {
            this.sendRestCommand(device.address,isyConstants.ISY_COMMAND_LOCK_LOCK,null);            
        } else if(command == isyConstants.USER_COMMAND_LOCK_UNLOCK) {
            this.sendRestCommand(device.address,isyConstants.ISY_COMMAND_LOCK_UNLOCK,null);
        } else {
            console.error('Unknown command: '+command+' for device '+device.name);
        }            
    } else if(device.deviceType == isyConstants.DEVICE_TYPE_FAN) {
        if(command == isyConstants.USER_COMMAND_FAN_OFF) {
            this.isy.sendCommand(this,isyConstants.ISY_COMMAND_FAN_OFF,null);
        } else if(command == isyConstants.USER_COMMAND_FAN_LOW) {
            this.isy.sendCommand(this,isyConstants.ISY_COMMAND_FAN_BASE,isyConstants.ISY_COMMAND_FAN_PARAMETER_LOW);
        } else if(command == isyConstants.USER_COMMAND_FAN_MEDIUM) {
            this.isy.sendCommand(this,isyConstants.ISY_COMMAND_FAN_BASE,isyConstants.ISY_COMMAND_FAN_PARAMETER_MEDIUM);
        } else if(command == isyConstants.USER_COMMAND_FAN_HIGH) {
            this.isy.sendCommand(this,isyConstants.ISY_COMMAND_FAN_BASE.isyConstants.ISY_COMMAND_FAN_PARAMETER_HIGHT);
        } else {
            console.error("Error commanding fan: "+this.name+" to invalid state: "+command);
        }        
    }
}

exports.ISY = ISY;
