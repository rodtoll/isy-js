


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
var ISYThermostatDevice = require('./isydevice').ISYThermostatDevice;
var ISYScene = require('./isyscene').ISYScene;
var ISYBaseDevice = require('./isydevice').ISYBaseDevice;
var ISYVariable = require('./isyvariable').ISYVariable;
var Parser = require('xml2js').Parser;

//import {xmlbuilder} from 'xmlbuilder';


function isyTypeToTypeName(isyType, address) {

    for (var index = 0; index < isyDeviceTypeList.length; index++) {
        if (isyDeviceTypeList[index].type == isyType) {
            var addressElementValue = isyDeviceTypeList[index].address;
            if (addressElementValue != "") {
                var lastAddressNumber = address[address.length - 1];
                if (lastAddressNumber != addressElementValue) {
                    continue;
                }
            }
            return isyDeviceTypeList[index];
        }
    }
    return null;
}

class ISY {
    constructor(address, username, password, elkEnabled, changeCallback, useHttps, scenesInDeviceList, enableDebugLogging, variableCallback) {
        this.address = address;
        this.userName = username;
        this.password = password;
        this.deviceIndex = {};
        this.deviceList = [];
        this.variableList = [];
        this.variableIndex = {};
        this.variableCallback = variableCallback;
        this.nodesLoaded = false;
        this.protocol = (useHttps == true) ? 'https' : 'http';
        this.elkEnabled = elkEnabled;
        this.zoneMap = {};
        this.sceneList = [];
        this.sceneIndex = {};
        this.debugLogEnabled = (enableDebugLogging == undefined) ? false : enableDebugLogging;
        this.scenesInDeviceList = (scenesInDeviceList == undefined) ? false : scenesInDeviceList;
        this.guardianTimer = null;
        if (this.elkEnabled) {
            this.elkAlarmPanel = new ELKAlarmPanelDevice(this, 1);
        }
        this.changeCallback = changeCallback;
    }
    logger(msg) {
        if (this.debugLogEnabled || (process.env.ISYJSDEBUG != undefined && process.env.ISYJSDEBUG != null)) {
            var timeStamp = new Date();
            console.log(`${timeStamp.getFullYear()}-${timeStamp.getMonth()}-${timeStamp.getDay()}#${timeStamp.getHours()}:${timeStamp.getMinutes()}:${timeStamp.getSeconds()}- ${msg}`);
        }
    }
    buildDeviceInfoRecord(isyType, deviceFamily, deviceType) {
        return {
            type: isyType,
            address: "",
            name: "Generic Device",
            deviceType: deviceType,
            connectionType: deviceFamily,
            batteryOperated: false
        };
    }
    getDeviceTypeBasedOnISYTable(deviceNode) {
        var familyId = 1;
        if (deviceNode.family!= null) {
            familyId = Number(deviceNode.family);
        }
        var isyType = deviceNode.type;
        var addressData = deviceNode.address;
        var addressElements = addressData.split(' ');
        var typeElements = isyType.split('.');
        var mainType = Number(typeElements[0]);
        var subType = Number(typeElements[1]);
        var subAddress = Number(addressElements[3]);
        // ZWave nodes identify themselves with devtype node
        if (deviceNode.devtype != null) {
            if (deviceNode.devtype.cat != null) {
                subType = Number(deviceNode.devtype.cat);
            }
        }
        // Insteon Device Family    
        if (familyId == 1) {
            // Dimmable Devices
            if (mainType == 1) {
                // Special case fanlinc has a fan element
                if (subType == 46 && subAddress == 2) {
                    return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_FAN);
                }
                else {
                    return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_DIMMABLE_LIGHT);
                }
            }
            else if (mainType == 2) {
                // Special case appliance Lincs into outlets
                if (subType == 6 || subType == 9 || subType == 12 || subType == 23) {
                    return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_OUTLET);
                    // Outlet lincs 
                }
                else if (subType == 8 || subType == 33) {
                    return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_OUTLET);
                    // Dual outlets    
                }
                else if (subType == 57) {
                    return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_OUTLET);
                }
                else {
                    return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_LIGHT);
                }
            }
            else if (mainType == 5) {
                if (subAddress == 1) {
                    return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_THERMOSTAT);
                }
                else {
                    return null; //Cool/Heat/Fan State
                }
                // Sensors
            }
            else if (mainType == 7) {
                // I/O Lincs
                if (subType == 0) {
                    if (subAddress == 1) {
                        return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_DOOR_WINDOW_SENSOR);
                    }
                    else {
                        return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_OUTLET);
                    }
                    // Other sensors. Not yet supported
                }
                else {
                    return null;
                }
                // Access controls/doors/locks
            }
            else if (mainType == 15) {
                // MorningLinc
                if (subType == 6) {
                    if (subAddress == 1) {
                        return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_LOCK);
                        // Ignore subdevice which operates opposite for the locks 
                    }
                    else {
                        return null;
                    }
                    // Other devices, going to guess they are similar to MorningLinc
                }
                else {
                    return null;
                }
            }
            else if (mainType == 16) {
                // Motion sensors
                if (subType == 1 || subType == 3) {
                    if (subAddress == 1) {
                        return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_MOTION_SENSOR);
                        // Ignore battery level sensor and daylight sensor
                    }
                    else {
                    }
                }
                else if (subType == 2 || subType == 9 || subType == 17) {
                    return this.buildDeviceInfoRecord(isyType, "Insteon", this.DEVICE_TYPE_DOOR_WINDOW_SENSOR);
                    // Smoke, leak sensors, don't yet know how to support
                }
                else {
                    return null;
                }
                // No idea how to test or support
            }
            else {
                return null;
            }
            // Z-Wave Device Family
        }
        else if (familyId == 4) {
            // Appears to be all ZWave devices seen so far
            if (mainType == 4) {
                // Identified by user zwave on/off switch
                if (subType == 16) {
                    return this.buildDeviceInfoRecord(isyType, "ZWave", this.DEVICE_TYPE_LIGHT);
                    // Identified by user door lock
                }
                else if (subType == 111) {
                    return this.buildDeviceInfoRecord(isyType, "ZWave", this.DEVICE_TYPE_SECURE_LOCK);
                    // This is a guess based on the naming in the ISY SDK
                }
                else if (subType == 109) {
                    return this.buildDeviceInfoRecord(isyType, "ZWave", this.DEVICE_TYPE_DIMMABLE_LIGHT);
                    // Otherwise we don't know how to handle
                }
                else {
                    return null;
                }
            }
        }
        return null;
    }
    nodeChangedHandler(node) {
        var that = this;
        if (this.nodesLoaded) {
            this.logger(`Node: ${node.address} changed`);
            this.changeCallback(that, node);
        }
    }
    getElkAlarmPanel() {
        return this.elkAlarmPanel;
    }
    loadNodes(result) {
        this.loadDevices2(result);
    
        var document = new xmldoc.XmlDocument(result);
        //var obj = JSON.parse(document.toString());
        //console.dir(obj.nodes.node);
        //this.loadDevices(document);
        this.loadScenes(document);
    }
    loadScenes(document) {
        var nodes = document.childrenNamed('group');
        for (var index = 0; index < nodes.length; index++) {
            var sceneAddress = nodes[index].childNamed('address').val;
            var sceneName = nodes[index].childNamed('name').val;
            var linkNodes = nodes[index].childNamed('members').childrenNamed('link');
            var childDevices = [];
            for (var linkIndex = 0; linkIndex < linkNodes.length; linkIndex++) {
                var linkDevice = this.deviceIndex[linkNodes[linkIndex].val];
                if (linkDevice != null && linkDevice != undefined) {
                    childDevices.push(linkDevice);
                }
            }
            var newScene = new ISYScene(this, sceneName, sceneAddress, childDevices);
            this.sceneList.push(newScene);
            this.sceneIndex[newScene.address] = newScene;
            if (this.scenesInDeviceList) {
                this.deviceIndex[newScene.address] = newScene;
                this.deviceList.push(newScene);
            }
        }
    }
    loadDevices(document) {
        var nodes = document.childrenNamed('node');
        for (var index = 0; index < nodes.length; index++) {
            var deviceAddress = nodes[index].childNamed('address').val;
            var isyDeviceType = nodes[index].childNamed('type').val;
            var deviceName = nodes[index].childNamed('name').val;
            var newDevice = null;
            var deviceTypeInfo = isyTypeToTypeName(isyDeviceType, deviceAddress);
            var enabled = nodes[index].childNamed('enabled').val;
            if (enabled !== 'false') {
                // Try fallback to new generic device identification when not specifically identified.  
                if (deviceTypeInfo == null) {
                    deviceTypeInfo = this.getDeviceTypeBasedOnISYTable(nodes[index]);
                }
                if (deviceTypeInfo != null) {
                    if (deviceTypeInfo.deviceType == this.DEVICE_TYPE_DIMMABLE_LIGHT ||
                        deviceTypeInfo.deviceType == this.DEVICE_TYPE_LIGHT) {
                        newDevice = new ISYLightDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType == this.DEVICE_TYPE_DOOR_WINDOW_SENSOR) {
                        newDevice = new ISYDoorWindowDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType == this.DEVICE_TYPE_MOTION_SENSOR) {
                        newDevice = new ISYMotionSensorDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType == this.DEVICE_TYPE_FAN) {
                        newDevice = new ISYFanDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType == this.DEVICE_TYPE_LOCK ||
                        deviceTypeInfo.deviceType == this.DEVICE_TYPE_SECURE_LOCK) {
                        newDevice = new ISYLockDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType == this.DEVICE_TYPE_OUTLET) {
                        newDevice = new ISYOutletDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType == this.DEVICE_TYPE_THERMOSTAT) {
                        newDevice = new ISYThermostatDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    // Support the device with a base device object
                }
                else {
                    this.logger('Device: ' + deviceName + ' type: ' + isyDeviceType + ' is not specifically supported, returning generic device object. ');
                    newDevice = new ISYBaseDevice(this, deviceName, deviceAddress, isyDeviceType, this.DEVICE_TYPE_UNKNOWN, 'Insteon');
                }
                if (newDevice != null) {
                    this.deviceIndex[deviceAddress] = newDevice;
                    this.deviceList.push(newDevice);
                    var properties = nodes[index].childrenNamed('property');
                    for (var j = 0; j < properties.length; j++) {
                        this.handleISYStateUpdate(deviceAddress, properties[j].attr.value, properties[j].attr.id);
                    }
                }
            }
            else {
                this.logger('Ignoring disabled device: ' + deviceName);
            }
        }
    }

    loadDevices2(result) {
        let doc = new Parser({explicitArray: false});
        
        doc.parseString(result,(err,obj) => {
            console.dir(obj.nodes.node);
            for(var device of obj.nodes.node)
            {
                console.log(device);
     
            var deviceAddress = device.address;
            var isyDeviceType = device.type;
            var deviceName = device.name;
            var newDevice = null;
            var deviceTypeInfo = isyTypeToTypeName(isyDeviceType, deviceAddress);
            var enabled = device.enabled;
            if (enabled !== 'false') {
                // Try fallback to new generic device identification when not specifically identified.  
                if (deviceTypeInfo == null) {
                    deviceTypeInfo = this.getDeviceTypeBasedOnISYTable(device);
                }
                if (deviceTypeInfo != null) {
                    if (deviceTypeInfo.deviceType == this.DEVICE_TYPE_DIMMABLE_LIGHT ||
                        deviceTypeInfo.deviceType == this.DEVICE_TYPE_LIGHT) {
                        newDevice = new ISYLightDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType == this.DEVICE_TYPE_DOOR_WINDOW_SENSOR) {
                        newDevice = new ISYDoorWindowDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType == this.DEVICE_TYPE_MOTION_SENSOR) {
                        newDevice = new ISYMotionSensorDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType == this.DEVICE_TYPE_FAN) {
                        newDevice = new ISYFanDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType == this.DEVICE_TYPE_LOCK ||
                        deviceTypeInfo.deviceType == this.DEVICE_TYPE_SECURE_LOCK) {
                        newDevice = new ISYLockDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType == this.DEVICE_TYPE_OUTLET) {
                        newDevice = new ISYOutletDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType == this.DEVICE_TYPE_THERMOSTAT) {
                        newDevice = new ISYThermostatDevice(this, deviceName, deviceAddress, deviceTypeInfo);
                    }
                    // Support the device with a base device object
                }
                else {
                    this.logger(`Device: ${deviceName} type: ${isyDeviceType} is not specifically supported, returning generic device object. `);
                    newDevice = new ISYBaseDevice(this, deviceName, deviceAddress, isyDeviceType, this.DEVICE_TYPE_UNKNOWN, 'Insteon');
                }
                if (newDevice != null) {
                    this.deviceIndex[deviceAddress] = newDevice;
                    this.deviceList.push(newDevice);
                    //var properties = nodes[index].childrenNamed('property');
                    for (var prop of device.property) {
                        this.handleISYStateUpdate(deviceAddress, prop.$.value, prop.$.id);
                    }
                }
            }
            else {
                this.logger(`Ignoring disabled device: ${deviceName}`);
            }
        } 
    });


    }

    loadElkNodes(result) {
        var document = new xmldoc.XmlDocument(result);
        var nodes = document.childNamed('areas').childNamed('area').childrenNamed('zone');
        for (var index = 0; index < nodes.length; index++) {
            var id = nodes[index].attr.id;
            var name = nodes[index].attr.name;
            var alarmDef = nodes[index].attr.alarmDef;
            var newDevice = new ElkAlarmSensor(this, name, 1, id, (alarmDef == 17) ? this.DEVICE_TYPE_CO_SENSOR : this.DEVICE_TYPE_ALARM_DOOR_WINDOW_SENSOR);
            this.zoneMap[newDevice.zone] = newDevice;
        }
    }
    loadElkInitialStatus(result) {
        var document = new xmldoc.XmlDocument(result);
        var nodes = document.childrenNamed('ae');
        for (var index = 0; index < nodes.length; index++) {
            this.elkAlarmPanel.setFromAreaUpdate(nodes[index]);
        }
        nodes = document.childrenNamed('ze');
        for (var index = 0; index < nodes.length; index++) {
            var id = nodes[index].attr.zone;
            var zoneDevice = this.zoneMap[id];
            if (zoneDevice != null) {
                zoneDevice.setFromZoneUpdate(nodes[index]);
                if (this.deviceIndex[zoneDevice.address] == null && zoneDevice.isPresent()) {
                    this.deviceList.push(zoneDevice);
                    this.deviceIndex[zoneDevice.address] = zoneDevice;
                }
            }
        }
    }
    finishInitialize(success, initializeCompleted) {
        this.nodesLoaded = true;
        initializeCompleted();
        if (success) {
            if (this.elkEnabled) {
                this.deviceList.push(this.elkAlarmPanel);
            }
            this.guardianTimer = setInterval(this.guardian.bind(this), 60000);
            this.initializeWebSocket();
        }
    }
    guardian() {
        var timeNow = new Date();
        if ((timeNow - this.lastActivity) > 60000) {
            this.logger('ISY-JS: Guardian: Detected no activity in more then 60 seconds. Reinitializing web sockets');
            this.initializeWebSocket();
        }
    }
    variableChangedHandler(variable) {
        this.logger('ISY-JS: Variable:' + variable.id + ' (' + variable.type + ') changed');
        if (this.variableCallback != null && this.variableCallback != undefined) {
            this.variableCallback(this, variable);
        }
    }
    checkForFailure(response) {
        return (response == null || response instanceof Error || response.statusCode != 200);
    }
    loadVariables(type, done) {
        var that = this;
        var options = {
            username: this.userName,
            password: this.password
        };
        restler.get(that.protocol + '://' + that.address + '/rest/vars/definitions/' + type, options).on('complete', function (result, response) {
            if (that.checkForFailure(response)) {
                that.logger("ISY-JS: Error loading variables from isy. Device likely doesn't have any variables defined. Safe to ignore.");
                done();
            }
            else {
                that.createVariables(type, result);
                restler.get(that.protocol + '://' + that.address + '/rest/vars/get/' + type, options).on('complete', function (result, response) {
                    if (that.checkForFailure(response)) {
                        that.logger('ISY-JS: Error loading variables from isy: ' + result.message);
                        throw new Error("Unable to load variables from the ISY");
                    }
                    else {
                        that.setVariableValues(result);
                    }
                    done();
                });
            }
        });
    }
    getVariableList() {
        return this.variableList;
    }
    getVariable(type, id) {
        var key = this.createVariableKey(type, id);
        if (this.variableIndex[key] != null && this.variableIndex[key] != undefined) {
            return this.variableIndex[key];
        }
        return null;
    }
    handleISYVariableUpdate(id, type, value, ts) {
        var variableToUpdate = this.getVariable(type, id);
        if (variableToUpdate != null) {
            variableToUpdate.value = value;
            variableToUpdate.lastChanged = ts;
            this.variableChangedHandler(variableToUpdate);
        }
    }
    createVariableKey(type, id) {
        return type + ':' + id;
    }
    createVariables(type, result) {
        var document = new xmldoc.XmlDocument(result);
        var variables = document.childrenNamed('e');
        for (var index = 0; index < variables.length; index++) {
            var id = variables[index].attr.id;
            var name = variables[index].attr.name;
            var newVariable = new ISYVariable(this, id, name, type);
            this.variableList.push(newVariable);
            this.variableIndex[this.createVariableKey(type, id)] = newVariable;
        }
    }
    setVariableValues(result) {
        var document = new xmldoc.XmlDocument(result);
        var variables = document.childrenNamed('var');
        for (var index = 0; index < variables.length; index++) {
            var variableNode = variables[index];
            var id = variableNode.attr.id;
            var type = variableNode.attr.type;
            var init = parseInt(variableNode.childNamed('init').val);
            var value = parseInt(variableNode.childNamed('val').val);
            var ts = variableNode.childNamed('ts').val;
            var variable = this.getVariable(type, id);
            if (variable != null) {
                variable.value = value;
                variable.init = init;
                variable.lastChanged = new Date(ts);
            }
        }
    }
    initialize(initializeCompleted) {
        var that = this;
        var options = {
            username: this.userName,
            password: this.password
        };
        restler.get(this.protocol + '://' + this.address + '/rest/nodes', options).on('complete', function (result, response) {
            if (that.checkForFailure(response)) {
                this.logger('ISY-JS: Error:' + result.message);
                throw new Error("Unable to contact the ISY to get the list of nodes");
            }
            else {
                that.loadNodes(result);
                that.loadVariables(that.VARIABLE_TYPE_INTEGER, function () {
                    that.loadVariables(that.VARIABLE_TYPE_STATE, function () {
                        if (that.elkEnabled) {
                            restler.get(that.protocol + '://' + that.address + '/rest/elk/get/topology', options).on('complete', function (result, response) {
                                if (that.checkForFailure(response)) {
                                    that.logger('ISY-JS: Error loading from elk: ' + result.message);
                                    throw new Error("Unable to contact the ELK to get the topology");
                                }
                                else {
                                    that.loadElkNodes(result);
                                    restler.get(that.protocol + '://' + that.address + '/rest/elk/get/status', options).on('complete', function (result, response) {
                                        if (that.checkForFailure(response)) {
                                            that.logger('ISY-JS: Error:' + result.message);
                                            throw new Error("Unable to get the status from the elk");
                                        }
                                        else {
                                            that.loadElkInitialStatus(result);
                                            that.finishInitialize(true, initializeCompleted);
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            that.finishInitialize(true, initializeCompleted);
                        }
                    });
                });
            }
        }).on('error', function (err, response) {
            that.logger("ISY-JS: Error while contacting ISY" + err);
            throw new Error("Error calling ISY" + err);
        }).on('fail', function (data, response) {
            that.logger("ISY-JS: Error while contacting ISY -- failure");
            throw new Error("Failed calling ISY");
        }).on('abort', function () {
            that.logger("ISY-JS: Abort while contacting ISY");
            throw new Error("Call to ISY was aborted");
        }).on('timeout', function (ms) {
            that.logger("ISY-JS: Timed out contacting ISY");
            throw new Error("Timeout contacting ISY");
        });
    }
    handleWebSocketMessage(event) {
        //console.log("WEBSOCKET: "+event.data);
        this.lastActivity = new Date();
        var document = new xmldoc.XmlDocument(event.data);
        if (document.childNamed('control') != null) {
            var controlElement = document.childNamed('control').val;
            var actionValue = document.childNamed('action').val;
            var address = document.childNamed('node').val;
            if (controlElement == '_19') {
                if (actionValue == 2) {
                    var aeElement = document.childNamed('eventInfo').childNamed('ae');
                    if (aeElement != null) {
                        if (this.elkAlarmPanel.setFromAreaUpdate(aeElement)) {
                            this.nodeChangedHandler(this.elkAlarmPanel);
                        }
                    }
                }
                else if (actionValue == 3) {
                    var zeElement = document.childNamed('eventInfo').childNamed('ze');
                    var zoneId = zeElement.attr.zone;
                    var zoneDevice = this.zoneMap[zoneId];
                    if (zoneDevice != null) {
                        if (zoneDevice.setFromZoneUpdate(zeElement)) {
                            this.nodeChangedHandler(zoneDevice);
                        }
                    }
                }
            }
            else if (controlElement == '_1') {
                if (actionValue == 6) {
                    var varNode = document.childNamed('eventInfo').childNamed('var');
                    if (varNode != null) {
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
            else {
                this.handleISYStateUpdate(address, actionValue, controlElement);
            }
        }
    }
    initializeWebSocket() {
        var that = this;
        var auth = 'Basic ' + new Buffer(this.userName + ':' + this.password).toString('base64');
        this.webSocket = new WebSocket.Client("ws://" + this.address + "/rest/subscribe", ["ISYSUB"], {
            headers: {
                "Origin": "com.universal-devices.websockets.isy",
                "Authorization": auth
            }
        });
        this.lastActivity = new Date();
        this.webSocket.on('message', function (event) {
            that.handleWebSocketMessage(event);
        });
    }
    getDeviceList() {
        return this.deviceList;
    }
    getDevice(address) {
        var s = this.deviceIndex[address];
        if (s == null)
            return this.deviceIndex[address.substr(0, address.length - 1) + '1'];
        return s;
    }
    getScene(address) {
        return this.sceneIndex[address];
    }
    getSceneList() {
        return this.sceneList;
    }
    handleISYStateUpdate(address, state, propertyName) {
        var deviceToUpdate = this.getDevice(address);
        //this.logger(deviceToUpdate+address+state+propertyName);
        var subAddress = address[address.length - 1];
        if (deviceToUpdate != undefined && deviceToUpdate != null) {
            if (deviceToUpdate.handleIsyUpdate(state, propertyName, subAddress)) {
                this.nodeChangedHandler(deviceToUpdate);
                if (this.scenesInDeviceList) {
                    // Inefficient, we could build a reverse index (device->scene list)
                    // but device list is relatively small
                    for (var scene in scene) {
                        if (scene.isDeviceIncluded(deviceToUpdate)) {
                            if (scene.reclalculateState()) {
                                this.nodeChangedHandler(this.scene);
                            }

                        }
                    }
                }
            }
        }
    }
    sendISYCommand(path, handleResult) {
        var uriToUse = this.protocol + '://' + this.address + '/rest/' + path;
        this.logger("ISY-JS: Sending ISY command..." + uriToUse);
        var options = {
            username: this.userName,
            password: this.password
        };
        restler.get(uriToUse, options).on('complete', function (data, response) {
            if (response.statusCode == 200) {
                handleResult(true);
            }
            else {
                handleResult(false);
            }
        });
    }
    sendRestCommand(deviceAddress, command, parameter, handleResult) {
        var uriToUse = this.protocol + '://' + this.address + '/rest/nodes/' + deviceAddress + '/cmd/' + command;
        if (parameter != null) {
            uriToUse += '/' + parameter;
        }
        this.logger("ISY-JS: Sending command..." + uriToUse);
        var options = {
            username: this.userName,
            password: this.password
        };
        restler.get(uriToUse, options).on('complete', function (data, response) {
            if (response.statusCode == 200) {
                handleResult(true);
            }
            else {
                handleResult(false);
            }
        });
    }
    sendGetVariable(id, type, handleResult) {
        var uriToUse = this.protocol + '://' + this.address + '/rest/vars/get/' + type + '/' + id;
        this.logger("ISY-JS: Sending ISY command..." + uriToUse);
        var options = {
            username: this.userName,
            password: this.password
        };
        restler.get(uriToUse, options).on('complete', function (result, response) {
            if (response.statusCode == 200) {
                var document = new xmldoc.XmlDocument(result);
                var val = parseInt(document.childNamed('val').val);
                var init = parseInt(document.childNamed('init').val);
                handleResult(val, init);
            }
        });
    }
    sendSetVariable(id, type, value, handleResult) {
        var uriToUse = this.protocol + '://' + this.address + '/rest/vars/set/' + type + '/' + id + '/' + value;
        this.logger("ISY-JS: Sending ISY command..." + uriToUse);
        var options = {
            username: this.userName,
            password: this.password
        };
        restler.get(uriToUse, options).on('complete', function (result, response) {
            if (response.statusCode == 200) {
                handleResult(true);
            }
            else {
                handleResult(false);
            }
        });
    }
}

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
ISY.prototype.DEVICE_TYPE_THERMOSTAT = 'Thermostat';
ISY.prototype.DEVICE_TYPE_SCENE = 'Scene';
ISY.prototype.VARIABLE_TYPE_INTEGER = '1';
ISY.prototype.VARIABLE_TYPE_STATE = '2';





































exports.ISY = ISY;

