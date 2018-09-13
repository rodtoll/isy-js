import * as rest from 'restler';
import {
    get,
    Service
} from 'restler';

import {
    XmlDocument
} from 'xmldoc';
import {
    Client
} from "faye-websocket/lib/faye/websocket";
import elkDevice from './elkdevice.js';
import isyDeviceTypeList, {
    length
} from "./isydevicetypes.json";
import {
    InsteonOutletDevice,
    InsteonRelayDevice,
    InsteonRelaySwitchDevice,
    InsteonDimmableDevice,
    InsteonDimmerSwitchDevice,
    InsteonSwitchDevice,
    InsteonDoorWindowSensorDevice,
    InsteonMotionSensorDevice,
    InsteonFanDevice,
    InsteonLockDevice,
    InsteonThermostatDevice,
    InsteonBaseDevice
} from './insteondevice.js';

import {
    ISYScene
} from './isyscene.js';
import {
    ISYDevice
} from './isydevice.js';
import {
    ISYVariable
} from './isyvariable.js';
import {
    Parser
} from 'xml2js';
import {

    States,
    Families,
    DeviceTypes,
    Categories,
    VariableTypes,
    Commands
} from "./isyconstants.js";
import {
    lookupService
} from 'dns';
import { getAsync } from './utils.js';

export {
    ISYScene,
    States,
    Families,
    DeviceTypes,
    Categories,
    ISYVariable,
    InsteonBaseDevice,
    InsteonOutletDevice,
    ISYDevice,
    InsteonFanDevice,
    InsteonLockDevice,
    InsteonThermostatDevice,
    InsteonDoorWindowSensorDevice,
    InsteonSwitchDevice,
    InsteonDimmerSwitchDevice,
    InsteonRelayDevice,
    InsteonMotionSensorDevice
};

function isyTypeToTypeName(isyType, address) {

    for (var index = 0; index < length; index++) {
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

const parser = new Parser({
    explicitArray: false,
    mergeAttrs: true
});

export let Controls = {};

export class ISY {
    constructor(address, username, password, elkEnabled, changeCallback, useHttps, scenesInDeviceList, enableDebugLogging, variableCallback, log) {
        this.address = address;
        this.userName = username;
        this.password = password;
        this.credentials = {
            username: this.userName,
            password: this.password
        };
        this.restlerOptions = {
            username: this.userName,
            password: this.password,
            parser: rest.parsers.xml,
            xml2js: {
                explicitArray: false,
                mergeAttrs: true
            }
        };

        this.deviceIndex = {};
        this.deviceList = [];
        this.deviceMap = new Map();
        this.variableList = [];
        this.variableIndex = {};
        this.variableCallback = variableCallback;
        this.nodesLoaded = false;
        this.protocol = (useHttps == true) ? 'https' : 'http';
        this.wsprotocol = 'ws';
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
        if (log === undefined) {
            this.log = msg => {
                var timeStamp = new Date();
                console.log(timeStamp.getFullYear() + '-' + timeStamp.getMonth() + '-' + timeStamp.getDay() + '#' + timeStamp.getHours() + ':' + timeStamp.getMinutes() + ':' + timeStamp.getSeconds() + '- ' + msg);

            };

        } else {
            this.log = log;

        }
        this.logger = (msg) => {
            if (this.debugLogEnabled || (process.env.ISYJSDEBUG != undefined && process.env.ISYJSDEBUG != null)) {
             
                log(msg);
            }
        };
    }

    buildDeviceInfoRecord(isyType, connectionType, deviceType) {
        return {
            type: isyType,
            address: "",
            name: "Generic Device",
            deviceType,
            connectionType,
            batteryOperated: false
        };
    }

    callISY(url)
    {
         return getAsync.call(this,`${this.protocol}://${this.address}/rest/${url}/`,this.restlerOptions);
    }

    getDeviceTypeBasedOnISYTable(deviceNode) {
        var familyId = 1;
        if (deviceNode.family !== null) {
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
        if (familyId === Families.insteon) {
            // Dimmable Devices
            if (mainType === Categories.dimmableControl) {
                // Special case fanlinc has a fan element
                if (subType === 46 && subAddress === 2) {
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', DeviceTypes.fan);
                } else {
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', DeviceTypes.dimmableLight);
                }
            } else if (mainType === Categories.relayControl) {
                // Special case appliance Lincs into outlets
                if (subType === 6 || subType === 9 || subType === 12 || subType === 23) {
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', DeviceTypes.outlet);
                    // Outlet lincs
                } else if (subType === 8 || subType === 33) {
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', DeviceTypes.outlet);
                    // Dual outlets
                } else if (subType === 57) {
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', DeviceTypes.outlet);
                } else {
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', DeviceTypes.light);
                }
                // Sensors
            } else if (mainType === Categories.sensorActuator) {
                // I/O Lincs
                if (subType === 0) {
                    if (subAddress === 1) {
                        return this.buildDeviceInfoRecord(isyType, 'Insteon', DeviceTypes.doorWindowSensor);
                    } else {
                        return this.buildDeviceInfoRecord(isyType, 'Insteon', "outlet");
                    }
                    // Other sensors. Not yet supported
                }
                // Access controls/doors/locks
            } else if (mainType === Categories.accessControl) {
                // MorningLinc
                if (subType === 6) {
                    if (subAddress === 1) {
                        return this.buildDeviceInfoRecord(isyType, 'Insteon', "lock");
                        // Ignore subdevice which operates opposite for the locks
                    } else {
                        return null;
                    }
                    // Other devices, going to guess they are similar to MorningLinc
                }
            } else if (mainType === Categories.securityHealthSafety) {
                // Motion sensors
                if (subType === 1 || subType === 3) {
                    if (subAddress === 1) {
                        return this.buildDeviceInfoRecord(isyType, "Insteon", DeviceTypes.motionSensor);
                        // Ignore battery level sensor and daylight sensor
                    }
                } else if (subType === 2 || subType === 9 || subType === 17) {
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', DeviceTypes.doorWindowSensor);
                    // Smoke, leak sensors, don't yet know how to support
                }
                // No idea how to test or support
            } else if (mainType === Categories.climateControl) {
                // Thermostats
                return this.buildDeviceInfoRecord(isyType, "Insteon", DeviceTypes.thermostat);
            } else if (mainType === 6) {
                // Leak Sensors
                return this.buildDeviceInfoRecord(isyType, "Insteon", DeviceTypes.leakSensor);
            } else if (mainType === Categories.controller) {
                if (subType === 6 || subType === 8) {
                    // Insteon Remote
                    return this.buildDeviceInfoRecord(isyType, "Insteon", DeviceTypes.remote);
                }
            }
            // Z-Wave Device Family
        } else if (familyId === Families.zWave) {
            // Appears to be all ZWave devices seen so far
            if (mainType === 4) {
                // Identified by user zwave on/off switch
                if (subType === 16) {
                    return this.buildDeviceInfoRecord(isyType, 'ZWave', DeviceTypes.light);
                    // Identified by user door lock
                } else if (subType === 111) {
                    return this.buildDeviceInfoRecord(isyType, 'ZWave', DeviceTypes.lock);
                    // This is a guess based on the naming in the ISY SDK
                } else if (subType === 109) {
                    return this.buildDeviceInfoRecord(isyType, 'ZWave', DeviceTypes.dimmableLight);
                    // Otherwise we don't know how to handle
                }
            }
        } else if (familyId === Families.poly) {
            // Node Server Node
            if (mainType === 1 && subType === 1) { // Node Server Devices are reported as 1.1.0.0.
                return this.buildDeviceInfoRecord(isyType, "NodeServer", DeviceTypes.polyNode);
            }
            return this.buildDeviceInfoRecord(isyType, "Unknown", DeviceTypes.unknown);
        }

    }

    nodeChangedHandler(node, propertyName) {
        var that = this;
        if (this.nodesLoaded) {
            //this.logger(`Node: ${node.address} changed`);
            if (this.changeCallback !== undefined && this.changeCallback !== null)
                this.changeCallback(that, node, propertyName);
        }
    }

    getElkAlarmPanel() {
        return this.elkAlarmPanel;
    }

    loadNodes() {
      
        return this.callISY('nodes').then(result => {
            this.loadDevices(result);
            this.loadScenes(result);
        });
    }

    loadScenes(result) {
        for (let scene of result.nodes.group) {

            if (scene.name === "ISY") {
                continue;
            } // Skip ISY Scene

            let newScene = new ISYScene(this, scene);
            this.sceneList.push(newScene);
            this.sceneIndex[newScene.address] = newScene;
            if (this.scenesInDeviceList) {
                this.deviceIndex[newScene.address] = newScene;
                this.deviceList.push(newScene);
            }

        }
    }


    loadDevices(obj) {
        for (var device of obj.nodes.node) {

            if (!(this.deviceMap.has(device.pnode))) {
                let address = device.address;
                this.deviceMap[device.pnode] = {
                    address
                };
            } else {
                this.deviceMap[device.pnode].push(device.address);
            }
            var newDevice = null;
            var deviceTypeInfo = isyTypeToTypeName(device.type, device.address);
            // this.logger(JSON.stringify(deviceTypeInfo));

            var enabled = device.enabled;
            if (enabled !== 'false') {
                // Try fallback to new generic device identification when not specifically identified.  
                if (deviceTypeInfo == null) {
                    deviceTypeInfo = this.getDeviceTypeBasedOnISYTable(device);
                }
                if (deviceTypeInfo != null) {
                    if (deviceTypeInfo.deviceType == DeviceTypes.light)
                        newDevice = new InsteonRelaySwitchDevice(this, device, deviceTypeInfo);
                    else if (deviceTypeInfo.deviceType == DeviceTypes.dimmableLight)
                        newDevice = new InsteonDimmerSwitchDevice(this, device, deviceTypeInfo);
                    else if (deviceTypeInfo.deviceType == DeviceTypes.doorWindowSensor) {
                        newDevice = new InsteonDoorWindowSensorDevice(this, device, deviceTypeInfo);
                    } else if (deviceTypeInfo.deviceType == DeviceTypes.motionSensor) {
                        newDevice = new InsteonMotionSensorDevice(this, device, deviceTypeInfo);
                    } else if (deviceTypeInfo.deviceType == DeviceTypes.fan) {
                        newDevice = new InsteonFanDevice(this, device, deviceTypeInfo);
                    } else if (deviceTypeInfo.deviceType == DeviceTypes.lock ||
                        deviceTypeInfo.deviceType == DeviceTypes.secureLock) {
                        newDevice = new InsteonLockDevice(this, device, deviceTypeInfo);
                    } else if (deviceTypeInfo.deviceType == DeviceTypes.outlet) {
                        newDevice = new InsteonOutletDevice(this, device, deviceTypeInfo);
                    } else if (deviceTypeInfo.deviceType == DeviceTypes.thermostat) {
                        newDevice = new InsteonThermostatDevice(this, device, deviceTypeInfo);
                    }
                    
                    this.logger(`Device ${newDevice.name} added as ${ newDevice.constructor.name}.` );
                    
                    // Support the device with a base device object
                } else {
                    this.logger(`Device ${device.name} with type: ${device.type} and nodedef: ${device.nodeDefId} is not specifically supported, returning generic device object. `);
                    newDevice = new ISYDevice(this, device);
                }
                if (newDevice != null) {
                    this.deviceIndex[device.address] = newDevice;
                    this.deviceList.push(newDevice);

                }

            } else {
                this.logger(`Ignoring disabled device: ${device.name}`);
            }
        }



    }

    loadElkNodes(result) {
        var document = new XmlDocument(result);
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
        var p = new Parser({
            explicitArray: false,
            mergeAttrs: true
        });
        p.parseString(result, (err, res) => {
            if (err) throw err;


            for (let nodes of res.ae) {
                this.elkAlarmPanel.setFromAreaUpdate(nodes);
            }
            for (let nodes of res.ze) {
                var id = nodes.zone;
                var zoneDevice = this.zoneMap[id];
                if (zoneDevice !== null) {
                    zoneDevice.setFromZoneUpdate(nodes);
                    if (this.deviceIndex[zoneDevice.address] === null && zoneDevice.isPresent()) {
                        this.deviceList.push(zoneDevice);
                        this.deviceIndex[zoneDevice.address] = zoneDevice;
                    }
                }
            }
        });
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
            this.logger('Guardian: Detected no activity in more then 60 seconds. Reinitializing web sockets');
            this.initializeWebSocket();
        }
    }

    variableChangedHandler(variable) {
        this.logger('Variable:' + variable.id + ' (' + variable.type + ') changed');
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
        get(that.protocol + '://' + that.address + '/rest/vars/definitions/' + type, options).on('complete', (result, response) => {
            if (that.checkForFailure(response)) {
                that.logger("Error loading variables from isy. Device likely doesn't have any variables defined. Safe to ignore.");
                done();
            } else {
                that.createVariables(type, result);
                get(that.protocol + '://' + that.address + '/rest/vars/get/' + type, options).on('complete', (result, response) => {
                    if (that.checkForFailure(response)) {
                        that.logger('Error loading variables from isy: ' + result.message);
                        throw new Error("Unable to load variables from the ISY");
                    } else {
                        that.setVariableValues(result);
                    }
                    done();
                });
            }
        });
    }



     loadConfig() {
    
        return this.callISY('config').then(result => {
            let controls = result.configuration.controls;
            this.logger(controls.control);
            //var arr = new Array(controls.control);
            for (let ctl of controls.control) {
                //this.logger(ctl);
                Controls[ctl.name] = ctl;
             
            }
            //that.logger(JSON.stringify(that));
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
        var document = new XmlDocument(result);
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
        var document = new XmlDocument(result);
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

    getNodeDetail(device, callback) {

        get(`${this.protocol}://${this.address}/rest/nodes/${device.address}/`, this.restlerOptions).on('complete', result => {
            let nodeDetail = result.nodeInfo;
            callback(nodeDetail);
        }).on('error', (err, response) => {
            this.logger("Error while contacting ISY" + err);
            throw new Error("Error calling ISY" + err);
        }).on('fail', (data, response) => {
            this.logger("Error while contacting ISY -- failure");
            throw new Error("Failed calling ISY");
        }).on('abort', () => {
            this.logger("Abort while contacting ISY");
            throw new Error("Call to ISY was aborted");
        }).on('timeout', ms => {
            this.logger("Timed out contacting ISY");
            throw new Error("Timeout contacting ISY");
        });
    }

    refreshStatuses() {
        var that = this;
       return this.callISY('status').then( result => {
            //this.logger(JSON.stringify(result.nodes.node));
            for (let i = 0; i < result.nodes.node.length; i++) {
                let node = result.nodes.node[i];
                //this.logger(node);
                let device = that.getDevice(node.id);
                if (Array.isArray(node.property)) { 
                    for (var prop of node.property) {
                        device[prop.id] = Number(prop.value);
                        device.formatted[prop.id] = prop.formatted;
                        device.uom[prop.id] = prop.uom;
                        device.logger(`Property ${Controls[prop.id].label} (${prop.id}) initialized to: ${device[prop.id]} (${device.formatted[prop.id]})`);
                    }
                } else {
                    device[node.property.id] = Number(node.property.value);
                    device.formatted[node.property.id] = node.property.formatted;
                    device.uom[node.property.id] = node.property.uom;
                    device.logger(`Property ${Controls[node.property.id].label} (${node.property.id}) initialized to: ${device[node.property.id]} (${device.formatted[node.property.id]})`);
                }
            }
         
        });
    }


    initialize(initializeCompleted) {
        
        var that = this;
        let options = {
            username: this.userName,
            password: this.password
        };
        
        this.loadConfig().then(this.loadNodes.bind(this)).then(() =>
            this.refreshStatuses().then(() => {
                this.loadVariables(VariableTypes.integer, () => {
                    this.loadVariables(VariableTypes.state, () => {
                        if (this.elkEnabled) {
                            get(`${this.protocol}://${that.address}/rest/elk/get/topology`, options).on('complete', (result, response) => {
                                if (that.checkForFailure(response)) {
                                    that.logger('Error loading from elk: ' + result.message);
                                    throw new Error("Unable to contact the ELK to get the topology");
                                } else {
                                    that.loadElkNodes(result);
                                    get(that.protocol + '://' + that.address + '/rest/elk/get/status', options).on('complete', (result, response) => {
                                        if (that.checkForFailure(response)) {
                                            that.logger('Error:' + result.message);
                                            throw new Error("Unable to get the status from the elk");
                                        } else {
                                            that.loadElkInitialStatus(result);
                                            that.finishInitialize(true, initializeCompleted);
                                        }
                                    });
                                }
                            });
                        } else {
                            this.finishInitialize(true, initializeCompleted);
                        }
                    });
                });
            })).catch(reason => this.logger("Error calling ISY: " + reason));
    }

    handleWebSocketMessage(event) {

        this.lastActivity = new Date();
       
        parser.parseString(event.data, (err, res) => {
            if (err) throw err;
            var evt = res.Event;
            if (evt === undefined || evt.control === undefined) {
                return;
            }
            var actionValue = 0;
            if (evt.action instanceof Object) {
                actionValue = evt.action._;
            } else if (evt.action instanceof Number || evt.action instanceof String) {
                actionValue = Number(evt.action);
            }
            switch (evt.control) {

                case '_19':
                    if (actionValue === 2) {
                        var aeElement = evt.eventInfo.ae;
                        if (aeElement !== null) {
                            if (this.elkAlarmPanel.setFromAreaUpdate(aeElement)) {
                                this.nodeChangedHandler(this.elkAlarmPanel);
                            }
                        }
                    } else if (actionValue === 3) {
                        var zeElement = evt.eventInfo.ze;
                        var zoneId = zeElement.zone;
                        var zoneDevice = this.zoneMap[zoneId];
                        if (zoneDevice !== null) {
                            if (zoneDevice.setFromZoneUpdate(zeElement)) {
                                this.nodeChangedHandler(zoneDevice);
                            }
                        }
                    }
                    break;

                case '_1':
                    if (actionValue === 6) {
                        var varNode = evt.eventInfo.var;
                        if (varNode !== null) {
                            var id = varNode.id;
                            var type = varNode.type;
                            var val = parseInt(varNode.val);
                            var year = parseInt(varNode.ts.substr(0, 4));
                            var month = parseInt(varNode.ts.substr(4, 2));
                            var day = parseInt(varNode.ts.substr(6, 2));
                            var hour = parseInt(varNode.ts.substr(9, 2));
                            var min = parseInt(varNode.ts.substr(12, 2));
                            var sec = parseInt(varNode.ts.substr(15, 2));
                            var timeStamp = new Date(year, month, day, hour, min, sec);

                            this.handleISYVariableUpdate(id, type, val, timeStamp);
                        }
                    }
                    // Uncomment the following if you are missing events. Excluded by default because "_1:3" events
                    //   are usually duplicates of events already fired. You may want to check for dupes if you 
                    //   decide to uncomment this.
                    // 
                    // else if (actionValue === 3 || actionValue === '3') {
                    //     // [     ZW029_1]   USRNUM   1 (uom=70 prec=0)
                    //     // [     ZW029_1]       ST   0 (uom=11 prec=0)
                    //     // [     ZW029_1]       ST   0 (uom=11 prec=0)
                    //     // [     ZW029_1]    ALARM  24 (uom=15 prec=0)
                    //     // var inputString = "[     ZW029_1]   USRNUM   1 (uom=70 prec=0)"
                    //     var inputString = evt.eventInfo.replace(/\s\s+/g, ' ');
                    //     const nodeName = inputString.split(']')[0].split('[')[1].trim();
                    //     const nodeValueString = inputString.split(']')[1].split('(')[0].trim();
                    //     const nodeEvent = nodeValueString.split(' ')[0];
                    //     const eventValue = nodeValueString.split(' ')[1];
                    //     this.handleISYGenericPropertyUpdate(nodeName, eventValue, nodeEvent);
                    // }
                    break;

                default:
                    if (evt.node !== '' && evt.node !== undefined && evt.node !== null) {
                        //
                        let impactedDevice = this.getDevice(evt.node);
                        if (impactedDevice !== undefined && impactedDevice !== null) {
                            impactedDevice.handleEvent(evt);
                        }
                        else
                        {
                            this.logger(JSON.stringify(evt));
                        }

                    }
                    break;
            }
        });
    }



    initializeWebSocket() {
        var that = this;
        var auth = 'Basic ' + new Buffer(this.userName + ':' + this.password).toString('base64');
        that.logger('Connecting to: ' + this.wsprotocol + '://' + this.address + '/rest/subscribe');
        this.webSocket = new Client(
            `${this.wsprotocol}://${this.address}/rest/subscribe`, ['ISYSUB'], {
                headers: {
                    'Origin': 'com.universal-devices.websockets.isy',
                    'Authorization': auth
                },
                ping: 10
            });

        this.lastActivity = new Date();

        this.webSocket.on('message', event => {
            that.handleWebSocketMessage(event);
        }).on('error', (err, response) => {
            that.logger('Error while contacting ISY: ' + err);
            throw new Error('Error calling ISY' + err);
        }).on('fail', (data, response) => {
            that.logger('Error while contacting ISY -- failure');
            throw new Error('Failed calling ISY');
        }).on('abort', () => {
            that.logger('Abort while contacting ISY');
            throw new Error('Call to ISY was aborted');
        }).on('timeout', ms => {
            that.logger('Timed out contacting ISY');
            throw new Error('Timeout contacting ISY');
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


    sendISYCommand(path, handleResult) {
        var uriToUse = `${this.protocol}://${this.address}/rest/${path}`;
        this.logger("Sending ISY command..." + uriToUse);
        var options = {
            username: this.userName,
            password: this.password
        };
        get(uriToUse, options).on('complete', (data, response) => {
            if (response.statusCode === 200) {
                handleResult(true);
            } else {
                handleResult(false);
            }
        });
    }

    sendRestCommand(deviceAddress, command, parameter, handleResult) {
        var uriToUse = `${this.protocol}://${this.address}/rest/nodes/${deviceAddress}/cmd/${command}`;
        if (parameter != null) {
            uriToUse += '/' + parameter;
        }
        this.logger(`Sending command...${uriToUse}`);
        var options = {
            username: this.userName,
            password: this.password
        };
        get(uriToUse, options).on('complete', (data, response) => {
            if (response.statusCode == 200) {
                handleResult(true);
            } else {
                handleResult(false);
            }
        });
    }

    sendGetVariable(id, type, handleResult) {
        var uriToUse = `${this.protocol}://${this.address}/rest/vars/get/${type}/${id}`;
        this.logger(`Sending ISY command...${uriToUse}`);
        var options = {
            username: this.userName,
            password: this.password
        };
        get(uriToUse, options).on('complete', (result, response) => {
            if (response.statusCode == 200) {
                var document = new XmlDocument(result);
                var val = parseInt(document.childNamed('val').val);
                var init = parseInt(document.childNamed('init').val);
                handleResult(val, init);
            }
        });
    }
    sendSetVariable(id, type, value, handleResult) {
        var uriToUse = `${this.protocol}://${this.address}/rest/vars/set/${type}/${id}/${value}`;
        this.logger(`Sending ISY command...${uriToUse}`);
        var options = {
            username: this.userName,
            password: this.password
        };
        get(uriToUse, options).on('complete', (result, response) => {
            if (response.statusCode == 200) {
                handleResult(true);
            } else {
                handleResult(false);
            }
        });
    }
}