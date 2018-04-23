/* jshint esversion: 6 */
var restler = require('restler');
var xmldoc = require('xmldoc');
var x2j = require('xml2js');
var fs = require('fs');
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
var ISYLeakSensorDevice = require('./isydevice').ISYLeakSensorDevice;
var ISYRemoteDevice = require('./isydevice').ISYRemoteDevice;
var ISYScene = require('./isyscene').ISYScene;
var ISYThermostatDevice = require('./isydevice').ISYThermostatDevice;
var ISYBaseDevice = require('./isydevice').ISYBaseDevice;
var ISYVariable = require('./isyvariable').ISYVariable;
var ISYNodeServerNode = require('./isynodeserver').ISYNodeServerNode;

function isyTypeToTypeName(isyType, address) {
    for (var index = 0; index < isyDeviceTypeList.length; index++) {
        if (isyDeviceTypeList[index].type === isyType) {
            var addressElementValue = isyDeviceTypeList[index].address;
            if (addressElementValue !== "") {
                var lastAddressNumber = address[address.length - 1];
                if (lastAddressNumber !== addressElementValue) {
                    continue;
                }
            }
            return isyDeviceTypeList[index];
        }
    }
    return null;
}

var ISY = function(address, username, password, elkEnabled, changeCallback, useHttps, scenesInDeviceList, enableDebugLogging, variableCallback) {
    this.address = address;
    this.userName = username;
    this.password = password;
    this.deviceIndex = {};
    this.deviceList = [];
    this.variableList = [];
    this.variableIndex = {};
    this.variableCallback = variableCallback;
    this.nodesLoaded = false;
    this.protocol = (useHttps === true) ? 'https' : 'http';
    this.wsprotocol = 'ws'; //(useHttps === true) ? 'wss' : 'ws';
    this.elkEnabled = elkEnabled;
    this.zoneMap = {};
    this.sceneList = [];
    this.sceneIndex = {};
    this.debugLogEnabled = (enableDebugLogging === undefined) ? false : enableDebugLogging;
    this.scenesInDeviceList = (scenesInDeviceList === undefined) ? false : scenesInDeviceList;
    this.guardianTimer = null;
    if (this.elkEnabled) {
        this.elkAlarmPanel = new elkDevice.ELKAlarmPanelDevice(this, 1);
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
ISY.prototype.DEVICE_TYPE_ALARM_DOOR_WINDOW_SENSOR = 'AlarmDoorWindowSensor';
ISY.prototype.DEVICE_TYPE_CO_SENSOR = 'COSensor';
ISY.prototype.DEVICE_TYPE_ALARM_PANEL = 'AlarmPanel';
ISY.prototype.DEVICE_TYPE_MOTION_SENSOR = 'MotionSensor';
ISY.prototype.DEVICE_TYPE_LEAK_SENSOR = 'LeakSensor';
ISY.prototype.DEVICE_TYPE_REMOTE = "Remote";
ISY.prototype.DEVICE_TYPE_SCENE = 'Scene';
ISY.prototype.DEVICE_TYPE_THERMOSTAT = 'Thermostat';
ISY.prototype.DEVICE_TYPE_NODE_SERVER_NODE = 'NodeServerNode';
ISY.prototype.VARIABLE_TYPE_INTEGER = '1';
ISY.prototype.VARIABLE_TYPE_STATE = '2';

ISY.prototype.logger = function(msg) {
    if (this.debugLogEnabled || (process.env.ISYJSDEBUG !== undefined && process.env.ISYJSDEBUG !== null)) {
        var timeStamp = new Date();
        console.log(timeStamp.getFullYear() + "-" + timeStamp.getMonth() + "-" + timeStamp.getDay() + "#" + timeStamp.getHours() + ":" + timeStamp.getMinutes() + ":" + timeStamp.getSeconds() + "- " + msg);
    }
};

ISY.prototype.buildDeviceInfoRecord = function(isyType, deviceFamily, deviceType) {
    return {
        type: isyType,
        address: "",
        name: "Generic Device",
        deviceType: deviceType,
        connectionType: deviceFamily,
        batteryOperated: false
    };
};

ISY.prototype.getDeviceTypeBasedOnISYTable = function(deviceNode) {
    var familyId = 1;
    if (typeof deviceNode.family !== "undefined") {
        familyId = Number(deviceNode.family._);
    }
    var isyType = deviceNode.type;
    var addressData = deviceNode.address;
    var addressElements = addressData.split(' ');
    var typeElements = isyType.split('.');
    var mainType = Number(typeElements[0]);
    var subType = Number(typeElements[1]);
    var subAddress = Number(addressElements[3]);
    // ZWave nodes identify themselves with devtype node
    if (typeof deviceNode.devtype !== "undefined") {
        if (typeof deviceNode.devtype.cat !== "undefined") {
            subType = Number(deviceNode.devtype.cat);
        }
    }
    // Insteon Device Family    
    if (familyId === 1) {

        // Dimmable Devices
        if (mainType === 1) {
            // Special case fanlinc has a fan element
            if (subType === 46 && subAddress === 2) {
                return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_FAN);
            } else {
                return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_DIMMABLE_LIGHT);
            }
        } else if (mainType === 2) {
            // Special case appliance Lincs into outlets
            if (subType === 6 || subType === 9 || subType === 12 || subType === 23) {
                return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_OUTLET);
                // Outlet lincs 
            } else if (subType === 8 || subType === 33) {
                return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_OUTLET);
                // Dual outlets    
            } else if (subType === 57) {
                return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_OUTLET);
            } else {
                return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_LIGHT);
            }
            // Sensors
        } else if (mainType === 7) {
            // I/O Lincs
            if (subType === 0) {
                if (subAddress === 1) {
                    return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_DOOR_WINDOW_SENSOR);
                } else {
                    return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_OUTLET);
                }
                // Other sensors. Not yet supported
            } else {
                return null;
            }
            // Access controls/doors/locks
        } else if (mainType === 15) {
            // MorningLinc
            if (subType === 6) {
                if (subAddress === 1) {
                    return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_LOCK);
                    // Ignore subdevice which operates opposite for the locks
                } else {
                    return null;
                }
                // Other devices, going to guess they are similar to MorningLinc
            } else {
                return null;
            }
        } else if (mainType === 16) {
            // Motion sensors
            if (subType === 1 || subType === 3) {
                if (subAddress === 1) {
                    return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_MOTION_SENSOR);
                } else {
                    // Ignore battery level sensor and daylight sensor
                }
            } else if (subType === 2 || subType === 9 || subType === 17) {
                return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_DOOR_WINDOW_SENSOR);
                // Smoke, leak sensors, don't yet know how to support
            } else {
                return null;
            }
            // No idea how to test or support
        } else if (mainType === 5) {
            // Thermostats
            return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_THERMOSTAT);
        } else if (mainType === 6) {
            // Leak Sensors
            return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_LEAK_SENSOR);
        } else if (mainType === 0) {
            if (subType === 6 || subType === 8) {
                // Insteon Remote
                return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_REMOTE);
            } else {
                return null;
            }
        } else {
            return null;
        }
        // Z-Wave Device Family
    } else if (familyId === 4) {
        // Appears to be all ZWave devices seen so far
        if (mainType === 4) {
            // Identified by user zwave on/off switch
            if (subType === 16) {
                return this.buildDeviceInfoRecord(isyType, "ZWave", this.DEVICE_TYPE_LIGHT);
                // Identified by user door lock
            } else if (subType === 111) {
                return this.buildDeviceInfoRecord(isyType, "ZWave", this.DEVICE_TYPE_SECURE_LOCK);
                // This is a guess based on the naming in the ISY SDK
            } else if (subType === 109) {
                return this.buildDeviceInfoRecord(isyType, "ZWave", this.DEVICE_TYPE_DIMMABLE_LIGHT);
                // Otherwise we don't know how to handle
            } else {
                return null;
            }
        }
    } else if (familyId === 10) {
        // Node Server Node
        if (mainType === 1 && subType === 1) { // Node Server Devices are reported as 1.1.0.0.
            return this.buildDeviceInfoRecord(isyType, "NodeServer", this.DEVICE_TYPE_NODE_SERVER_NODE);
        }
    }
    return null;
};

ISY.prototype.nodeChangedHandler = function(node) {
    var that = this;
    if (this.nodesLoaded) {
        this.logger('Node: ' + node.address + ' changed');
        this.changeCallback(that, node);
    }
};

ISY.prototype.getElkAlarmPanel = function() {
    return this.elkAlarmPanel;
};

ISY.prototype.loadNodesJS = function(result) {
    this.loadDevicesJS(result);
    this.loadScenesJS(result);
};

ISY.prototype.loadScenesJS = function(result) {
    for (let scene of result.nodes.group) {
        var sceneAddress = scene.address;
        var sceneName = scene.name;
        if (sceneName === "ISY") { continue; } // Skip ISY Scene
        var childDevices = [];
        if (typeof scene.members.link === "undefined") {
            continue; // Skip Empty Scene
        } else if (Array.isArray(scene.members.link)) {
            for (let node of scene.members.link) {
                if ("_" in node) {
                    childDevices.push(node._);
                }
            }
        } else if (typeof scene.members.link === "object") {
            childDevices.push(scene.members.link._); // Scene with 1 link returned as object.
        }

        var newScene = new ISYScene(this, sceneName, sceneAddress, childDevices);
        this.sceneList.push(newScene);
        this.sceneIndex[newScene.address] = newScene;
        if (this.scenesInDeviceList) {
            this.deviceIndex[newScene.address] = newScene;
            this.deviceList.push(newScene);
        }
    }
};

ISY.prototype.loadDevicesJS = function(result) {
    for (let node of result.nodes.node) {
        var deviceAddress = ("address" in node) ? node.address : "00 00 00 1";
        var isyDeviceType = ("type" in node) ? node.type : "Unknown Type";
        var deviceName = ("name" in node) ? node.name : "Unnamed Device";
        var newDevice = null;
        var deviceTypeInfo = isyTypeToTypeName(isyDeviceType, deviceAddress);
        var enabled = ("enabled" in node) ? node.enabled : false;

        if (enabled !== 'false') {
            // Try fallback to new generic device identification when not specifically identified.  
            if (deviceTypeInfo === null) {
                deviceTypeInfo = this.getDeviceTypeBasedOnISYTable(node);
            }
            if (deviceTypeInfo !== null) {
                if (deviceTypeInfo.deviceType === this.DEVICE_TYPE_DIMMABLE_LIGHT ||
                    deviceTypeInfo.deviceType === this.DEVICE_TYPE_LIGHT) {
                    newDevice = new ISYLightDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                } else if (deviceTypeInfo.deviceType === this.DEVICE_TYPE_DOOR_WINDOW_SENSOR) {
                    newDevice = new ISYDoorWindowDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                } else if (deviceTypeInfo.deviceType === this.DEVICE_TYPE_MOTION_SENSOR) {
                    newDevice = new ISYMotionSensorDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                } else if (deviceTypeInfo.deviceType === this.DEVICE_TYPE_LEAK_SENSOR) {
                    newDevice = new ISYLeakSensorDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                } else if (deviceTypeInfo.deviceType === this.DEVICE_TYPE_REMOTE) {
                    newDevice = new ISYRemoteDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                } else if (deviceTypeInfo.deviceType === this.DEVICE_TYPE_FAN) {
                    newDevice = new ISYFanDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                } else if (deviceTypeInfo.deviceType === this.DEVICE_TYPE_LOCK ||
                    deviceTypeInfo.deviceType === this.DEVICE_TYPE_SECURE_LOCK) {
                    newDevice = new ISYLockDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                } else if (deviceTypeInfo.deviceType === this.DEVICE_TYPE_OUTLET) {
                    newDevice = new ISYOutletDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                } else if (deviceTypeInfo.deviceType === this.DEVICE_TYPE_THERMOSTAT) {
                    var status;
                    if (deviceAddress.endsWith('1')) {
                        status = node.property;
                    }
                    newDevice = new ISYThermostatDevice(this, deviceName, deviceAddress, deviceTypeInfo, status);
                } else if (deviceTypeInfo.deviceType === this.DEVICE_TYPE_NODE_SERVER_NODE) {
                    newDevice = new ISYNodeServerNode(
                        this,
                        deviceName,
                        deviceAddress,
                        this.DEVICE_TYPE_NODE_SERVER_NODE,
                        node.family.instance, // Node Server Number
                        node.pnode, // Parent Node Address
                        node.nodeDefId // Node Type
                    );
                }
                // Support the device with a base device object
            } else {
                this.logger('Device: ' + deviceName + ' type: ' + isyDeviceType + ' is not specifically supported, returning generic device object. ');
                newDevice = new ISYBaseDevice(
                    this,
                    deviceName,
                    deviceAddress,
                    isyDeviceType,
                    this.DEVICE_TYPE_UNKNOWN,
                    'Insteon'
                );
            }
            if (newDevice !== null) {
                this.deviceIndex[deviceAddress] = newDevice;
                this.deviceList.push(newDevice);
                if ("property" in node && typeof node.property === "object") {
                    this.handleISYStateUpdate(deviceAddress, node.property.value);
                }
            }
        } else {
            this.logger('Ignoring disabled device: ' + deviceName);
        }
    }
};

ISY.prototype.loadElkNodes = function(result) {
    var document = new xmldoc.XmlDocument(result);
    var nodes = document.childNamed('areas').childNamed('area').childrenNamed('zone');
    for (var index = 0; index < nodes.length; index++) {
        var id = nodes[index].attr.id;
        var name = nodes[index].attr.name;
        var alarmDef = nodes[index].attr.alarmDef;

        var newDevice = new elkDevice.ElkAlarmSensor(
            this,
            name,
            1,
            id,
            (alarmDef == 17) ? this.DEVICE_TYPE_CO_SENSOR : this.DEVICE_TYPE_ALARM_DOOR_WINDOW_SENSOR);
        this.zoneMap[newDevice.zone] = newDevice;
    }
};

ISY.prototype.loadElkInitialStatus = function(result) {
    var document = new xmldoc.XmlDocument(result);
    var nodes = document.childrenNamed('ae');
    for (var index = 0; index < nodes.length; index++) {
        this.elkAlarmPanel.setFromAreaUpdate(nodes[index]);
    }
    nodes = document.childrenNamed('ze');
    for (index = 0; index < nodes.length; index++) {
        var id = nodes[index].attr.zone;
        var zoneDevice = this.zoneMap[id];
        if (zoneDevice !== null) {
            zoneDevice.setFromZoneUpdate(nodes[index]);
            if (this.deviceIndex[zoneDevice.address] === null && zoneDevice.isPresent()) {
                this.deviceList.push(zoneDevice);
                this.deviceIndex[zoneDevice.address] = zoneDevice;
            }
        }
    }
};

ISY.prototype.finishInitialize = function(success, initializeCompleted) {
    this.nodesLoaded = true;
    initializeCompleted();
    if (success) {
        if (this.elkEnabled) {
            this.deviceList.push(this.elkAlarmPanel);
        }
        this.guardianTimer = setInterval(this.guardian.bind(this), 60000);
        this.initializeWebSocket();
    }
};

ISY.prototype.guardian = function() {
    var timeNow = new Date();
    if ((timeNow - this.lastActivity) > 60000) {
        this.logger('ISY-JS: Guardian: Detected no activity in more then 60 seconds. Reinitializing web sockets');
        this.initializeWebSocket();
    }
};

ISY.prototype.variableChangedHandler = function(variable) {
    this.logger('ISY-JS: Variable:' + variable.id + ' (' + variable.type + ') changed');
    if (this.variableCallback !== null && this.variableCallback !== undefined) {
        this.variableCallback(this, variable);
    }
};

ISY.prototype.checkForFailure = function(response) {
    return (response === null || response instanceof Error || response.statusCode !== 200);
};

ISY.prototype.loadVariables = function(type, done) {
    var that = this;
    var options = {
        username: this.userName,
        password: this.password
    };
    var retryCount = 0;

    // Note: occasionally this fails on the first call and we need to re-call
    var getInitialValuesCB = function(result, response) {
        if (that.checkForFailure(response)) {
            that.logger('ISY-JS: Error loading variables from isy: ' + result.message + "\nRetrying...");
            retryCount++;
            getVariableInitialValues();
        } else {
            that.setVariableValues(result);
        }
        done();
    };

    var getVariableInitialValues = function() {
        // Check if we've exceeded the retry count.
        if (retryCount > 2) {
            throw new Error("Unable to load variables from the ISY after " + retryCount + " retries.");
        }

        // Load initial values
        restler.get(
            that.protocol + '://' + that.address + '/rest/vars/get/' + type,
            options
        ).on('complete', getInitialValuesCB);
    };

    // Callback function to get the variable values after getting definitions
    var loadVariablesCB = function(result, response) {
        if (that.checkForFailure(response)) {
            that.logger("ISY-JS: Error loading variables from isy. Device likely doesn't have any variables defined. Safe to ignore.");
            done();
        } else {
            that.createVariables(type, result);
            getVariableInitialValues();
        }
    };

    // Load definitions
    restler.get(
        that.protocol + '://' + that.address + '/rest/vars/definitions/' + type,
        options
    ).on('complete', loadVariablesCB);

};

ISY.prototype.getVariableList = function() {
    return this.variableList;
};

ISY.prototype.getVariable = function(type, id) {
    var key = this.createVariableKey(type, id);
    if (this.variableIndex[key] !== null && this.variableIndex[key] !== undefined) {
        return this.variableIndex[key];
    }
    return null;
};

ISY.prototype.handleISYVariableUpdate = function(id, type, value, ts) {
    var variableToUpdate = this.getVariable(type, id);
    if (variableToUpdate !== null) {
        variableToUpdate.value = value;
        variableToUpdate.lastChanged = ts;
        this.variableChangedHandler(variableToUpdate);
    }
};

ISY.prototype.createVariableKey = function(type, id) {
    return type + ':' + id;
};

ISY.prototype.createVariables = function(type, result) {
    var p = new x2j.Parser({ explicitArray: false, mergeAttrs: true });
    p.parseString(result, (err, res) => {
        if (err) throw err;

        for (let v of res.CList.e) {
            var newVariable = new ISYVariable(this, v.id, v.name, type);

            // Don't push duplicate variables.
            if (this.variableList.indexOf(newVariable) !== -1) { return; }
            if (this.createVariableKey(type, v.id) in this.variableIndex) { return; }

            this.variableList.push(newVariable);
            this.variableIndex[this.createVariableKey(type, v.id)] = newVariable;
        }
    });
};

ISY.prototype.setVariableValues = function(result) {
    var p = new x2j.Parser({ explicitArray: false, mergeAttrs: true });
    p.parseString(result, (err, res) => {
        if (err) throw err;

        for (let vNode of res.vars.var) {
            var id = vNode.id;
            var type = vNode.type;
            var init = parseInt(vNode.init);
            var value = parseInt(vNode.val);
            var ts = vNode.ts;

            var variable = this.getVariable(type, id);

            if (variable !== null) {
                variable.value = value;
                variable.init = init;
                variable.lastChanged = new Date(ts);
            }
        }
    });
};

ISY.prototype.initialize = function(initializeCompleted) {
    var that = this;

    var options = {
        username: this.userName,
        password: this.password
    };

    restler.get(
        this.protocol + '://' + this.address + '/rest/nodes',
        options
    ).on('complete', function(result, response) {
        if (that.checkForFailure(response)) {
            this.logger('ISY-JS: Error:' + result.message);
            throw new Error("Unable to contact the ISY to get the list of nodes");
        } else {
            this.webSocket = null;
            this.nodesLoaded = false;
            this.deviceIndex = {};
            this.deviceList = [];
            this.sceneList = [];
            this.sceneIndex = {};
            this.variableList = [];
            this.variableIndex = {};
            this.zoneMap = {};

            // TODO: Finish migration to JSON from XML
            var p = new x2j.Parser({ explicitArray: false, mergeAttrs: true });
            p.parseString(result, function(err, res) {
                if (err) throw err;
                //this.logger(JSON.stringify(res, undefined, 3));
                that.loadNodesJS(res);
            });

            that.loadVariables(that.VARIABLE_TYPE_INTEGER, function() {
                that.loadVariables(that.VARIABLE_TYPE_STATE, function() {
                    if (that.elkEnabled) {
                        restler.get(
                            that.protocol + '://' + that.address + '/rest/elk/get/topology',
                            options
                        ).on('complete', function(result, response) {
                            if (that.checkForFailure(response)) {
                                that.logger('ISY-JS: Error loading from elk: ' + result.message);
                                throw new Error("Unable to contact the ELK to get the topology");
                            } else {
                                that.loadElkNodes(result);
                                restler.get(
                                    that.protocol + '://' + that.address + '/rest/elk/get/status',
                                    options
                                ).on('complete', function(result, response) {
                                    if (that.checkForFailure(response)) {
                                        that.logger('ISY-JS: Error:' + result.message);
                                        throw new Error("Unable to get the status from the elk");
                                    } else {
                                        that.loadElkInitialStatus(result);
                                        that.finishInitialize(true, initializeCompleted);
                                    }
                                });
                            }
                        });
                    } else {
                        that.finishInitialize(true, initializeCompleted);
                    }
                });
            });
        }
    }).on('error', function(err, response) {
        that.logger("ISY-JS: Error while contacting ISY" + err);
        throw new Error("Error calling ISY" + err);
    }).on('fail', function(data, response) {
        that.logger("ISY-JS: Error while contacting ISY -- failure");
        throw new Error("Failed calling ISY");
    }).on('abort', function() {
        that.logger("ISY-JS: Abort while contacting ISY");
        throw new Error("Call to ISY was aborted");
    }).on('timeout', function(ms) {
        that.logger("ISY-JS: Timed out contacting ISY");
        throw new Error("Timeout contacting ISY");
    });
};

ISY.prototype.handleWebSocketMessage = function(event) {
    //console.log("WEBSOCKET: "+event.data);
    this.lastActivity = new Date();
    var document = new xmldoc.XmlDocument(event.data);
    if (typeof document.childNamed('control') !== "undefined") {
        var controlElement = document.childNamed('control').val;
        var actionValue = document.childNamed('action').val;
        var address = document.childNamed('node').val;
        if (controlElement == 'ST') {
            this.handleISYStateUpdate(address, actionValue);
        } else if (controlElement == 'CLIHCS' || controlElement == 'CLISPH' ||
            controlElement == "CLISPC" || controlElement == "CLIHUM" ||
            controlElement == "CLIFS" || controlElement == "CLIMD") {
            // Thermostat Events
            this.handleISYTstatUpdate(address, actionValue, controlElement);
        } else if (controlElement == '_19') {
            if (actionValue === 2 || actionValue === "2") {
                var aeElement = document.childNamed('eventInfo').childNamed('ae');
                if (aeElement !== null) {
                    if (this.elkAlarmPanel.setFromAreaUpdate(aeElement)) {
                        this.nodeChangedHandler(this.elkAlarmPanel);
                    }
                }
            } else if (actionValue === 3 || actionValue === "3") {
                var zeElement = document.childNamed('eventInfo').childNamed('ze');
                var zoneId = zeElement.attr.zone;
                var zoneDevice = this.zoneMap[zoneId];
                if (zoneDevice !== null) {
                    if (zoneDevice.setFromZoneUpdate(zeElement)) {
                        this.nodeChangedHandler(zoneDevice);
                    }
                }
            }
        } else if (controlElement == '_1') {
            if (actionValue === 6 || actionValue === "6") {
                var varNode = document.childNamed('eventInfo').childNamed('var');
                if (varNode !== null) {
                    var id = varNode.attr.id;
                    var type = varNode.attr.type;
                    var val = parseInt(varNode.childNamed('val').val);
                    var ts = varNode.childNamed('ts').val;
                    var year = parseInt(ts.substr(0, 4));
                    var month = parseInt(ts.substr(4, 2));
                    var day = parseInt(ts.substr(6, 2));
                    var hour = parseInt(ts.substr(9, 2));
                    var min = parseInt(ts.substr(12, 2));
                    var sec = parseInt(ts.substr(15, 2));
                    var timeStamp = new Date(year, month, day, hour, min, sec);

                    this.handleISYVariableUpdate(id, type, val, timeStamp);
                }
            }
        }
    }
};

ISY.prototype.initializeWebSocket = function() {
    var that = this;
    var auth = 'Basic ' + new Buffer(this.userName + ':' + this.password).toString('base64');
    that.logger("Connecting to: " + this.wsprotocol + "://" + this.address + "/rest/subscribe");
    this.webSocket = new WebSocket.Client(
        this.wsprotocol + "://" + this.address + "/rest/subscribe", ["ISYSUB"], {
            headers: {
                "Origin": "com.universal-devices.websockets.isy",
                "Authorization": auth
            },
            ping: 10
        });

    this.lastActivity = new Date();

    this.webSocket.on('message', function(event) {
        that.handleWebSocketMessage(event);
    }).on('error', function(err, response) {
        that.logger("ISY-JS: Error while contacting ISY" + err);
        throw new Error("Error calling ISY" + err);
    }).on('fail', function(data, response) {
        that.logger("ISY-JS: Error while contacting ISY -- failure");
        throw new Error("Failed calling ISY");
    }).on('abort', function() {
        that.logger("ISY-JS: Abort while contacting ISY");
        throw new Error("Call to ISY was aborted");
    }).on('timeout', function(ms) {
        that.logger("ISY-JS: Timed out contacting ISY");
        throw new Error("Timeout contacting ISY");
    });
};

ISY.prototype.getDeviceList = function() {
    return this.deviceList;
};

ISY.prototype.getDevice = function(address) {
    return this.deviceIndex[address];
};

ISY.prototype.getScene = function(address) {
    return this.sceneIndex[address];
};

ISY.prototype.getSceneList = function() {
    return this.sceneList;
};

ISY.prototype.handleISYStateUpdate = function(address, state) {
    var deviceToUpdate = this.deviceIndex[address];
    if (deviceToUpdate !== undefined && deviceToUpdate !== null) {
        if (deviceToUpdate.handleIsyUpdate(state)) {
            this.nodeChangedHandler(deviceToUpdate);
            if (this.scenesInDeviceList) {
                // Inefficient, we could build a reverse index (device->scene list)
                // but device list is relatively small
                for (var index = 0; index < this.sceneList.length; index++) {
                    if (this.sceneList[index].isDeviceIncluded(deviceToUpdate)) {
                        if (this.sceneList[index].reclalculateState()) {
                            this.nodeChangedHandler(this.sceneList[index]);
                        }
                    }
                }
            }
        }
    }
};

ISY.prototype.handleISYTstatUpdate = function(address, state, prop) {
    var deviceToUpdate = this.deviceIndex[address];
    if (deviceToUpdate !== undefined && deviceToUpdate !== null) {
        if (deviceToUpdate.handleIsyTstatUpdate(state, prop)) {
            this.nodeChangedHandler(deviceToUpdate);
        }
    }
};

ISY.prototype.sendISYCommand = function(path, handleResult) {
    var uriToUse = this.protocol + '://' + this.address + '/rest/' + path;
    this.logger("ISY-JS: Sending ISY command..." + uriToUse);
    var options = {
        username: this.userName,
        password: this.password
    };
    restler.get(uriToUse, options).on('complete', function(data, response) {
        if (response.statusCode === 200) {
            handleResult(true);
        } else {
            handleResult(false);
        }
    });
};

ISY.prototype.sendRestCommand = function(deviceAddress, command, parameter, handleResult) {
    var uriToUse = this.protocol + '://' + this.address + '/rest/nodes/' + deviceAddress + '/cmd/' + command;
    if (parameter !== null) {
        uriToUse += '/' + parameter;
    }
    this.logger("ISY-JS: Sending command..." + uriToUse);
    var options = {
        username: this.userName,
        password: this.password
    };
    restler.get(uriToUse, options).on('complete', function(data, response) {
        if (response.statusCode === 200) {
            handleResult(true);
        } else {
            handleResult(false);
        }
    });
};

ISY.prototype.sendGetVariable = function(id, type, handleResult) {
    var uriToUse = this.protocol + '://' + this.address + '/rest/vars/get/' + type + '/' + id;
    this.logger("ISY-JS: Sending ISY command..." + uriToUse);
    var options = {
        username: this.userName,
        password: this.password
    };
    restler.get(uriToUse, options).on('complete', function(result, response) {
        if (response.statusCode === 200) {
            var document = new xmldoc.XmlDocument(result);
            var val = parseInt(document.childNamed('val').val);
            var init = parseInt(document.childNamed('init').val);
            handleResult(val, init);
        }
    });
};

ISY.prototype.sendSetVariable = function(id, type, value, handleResult) {
    var uriToUse = this.protocol + '://' + this.address + '/rest/vars/set/' + type + '/' + id + '/' + value;
    this.logger("ISY-JS: Sending ISY command..." + uriToUse);
    var options = {
        username: this.userName,
        password: this.password
    };
    restler.get(uriToUse, options).on('complete', function(result, response) {
        if (response.statusCode === 200) {
            handleResult(true);
        } else {
            handleResult(false);
        }
    });
};

ISY.prototype.runProgram = function(id, command, handleResult) {
    // Possible Commands: run|runThen|runElse|stop|enable|disable|enableRunAtStartup|disableRunAtStartup
    var uriToUse = this.protocol + '://' + this.address + '/rest/programs/' + id + '/' + command;
    this.logger("ISY-JS: Sending program command..." + uriToUse);
    var options = {
        username: this.userName,
        password: this.password
    };
    restler.get(uriToUse, options).on('complete', function(data, response) {
        if (response.statusCode === 200) {
            handleResult(true);
        } else {
            handleResult(false);
        }
    });
};

exports.ISY = ISY;