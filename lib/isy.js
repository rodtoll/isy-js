'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ISY = exports.Controls = exports.InsteonMotionSensorDevice = exports.InsteonRelayDevice = exports.InsteonDimmerSwitchDevice = exports.InsteonSwitchDevice = exports.InsteonDoorWindowSensorDevice = exports.InsteonThermostatDevice = exports.InsteonLockDevice = exports.InsteonFanDevice = exports.ISYDevice = exports.InsteonOutletDevice = exports.InsteonBaseDevice = exports.ISYVariable = exports.Categories = exports.DeviceTypes = exports.Families = exports.States = exports.ISYScene = undefined;

var _restler = require('restler');

var rest = _interopRequireWildcard(_restler);

var _xmldoc = require('xmldoc');

var _websocket = require('faye-websocket/lib/faye/websocket');

var _elkdevice = require('./elkdevice.js');

var _elkdevice2 = _interopRequireDefault(_elkdevice);

var _isydevicetypes = require('./isydevicetypes.json');

var _isydevicetypes2 = _interopRequireDefault(_isydevicetypes);

var _insteondevice = require('./insteondevice.js');

var _isyscene = require('./isyscene.js');

var _isydevice = require('./isydevice.js');

var _isyvariable = require('./isyvariable.js');

var _xml2js = require('xml2js');

var _isyconstants = require('./isyconstants.js');

var _dns = require('dns');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.ISYScene = _isyscene.ISYScene;
exports.States = _isyconstants.States;
exports.Families = _isyconstants.Families;
exports.DeviceTypes = _isyconstants.DeviceTypes;
exports.Categories = _isyconstants.Categories;
exports.ISYVariable = _isyvariable.ISYVariable;
exports.InsteonBaseDevice = _insteondevice.InsteonBaseDevice;
exports.InsteonOutletDevice = _insteondevice.InsteonOutletDevice;
exports.ISYDevice = _isydevice.ISYDevice;
exports.InsteonFanDevice = _insteondevice.InsteonFanDevice;
exports.InsteonLockDevice = _insteondevice.InsteonLockDevice;
exports.InsteonThermostatDevice = _insteondevice.InsteonThermostatDevice;
exports.InsteonDoorWindowSensorDevice = _insteondevice.InsteonDoorWindowSensorDevice;
exports.InsteonSwitchDevice = _insteondevice.InsteonSwitchDevice;
exports.InsteonDimmerSwitchDevice = _insteondevice.InsteonDimmerSwitchDevice;
exports.InsteonRelayDevice = _insteondevice.InsteonRelayDevice;
exports.InsteonMotionSensorDevice = _insteondevice.InsteonMotionSensorDevice;


function isyTypeToTypeName(isyType, address) {

    for (var index = 0; index < _isydevicetypes.length; index++) {
        if (_isydevicetypes2.default[index].type == isyType) {
            var addressElementValue = _isydevicetypes2.default[index].address;
            if (addressElementValue != "") {
                var lastAddressNumber = address[address.length - 1];
                if (lastAddressNumber != addressElementValue) {
                    continue;
                }
            }
            return _isydevicetypes2.default[index];
        }
    }
    return null;
}

const parser = new _xml2js.Parser({
    explicitArray: false
});

let Controls = exports.Controls = {};

class ISY {
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
        this.protocol = useHttps == true ? 'https' : 'http';
        this.wsprotocol = 'ws';
        this.elkEnabled = elkEnabled;
        this.zoneMap = {};
        this.sceneList = [];
        this.sceneIndex = {};
        this.debugLogEnabled = enableDebugLogging == undefined ? false : enableDebugLogging;
        this.scenesInDeviceList = scenesInDeviceList == undefined ? false : scenesInDeviceList;
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
        this.logger = msg => {
            if (this.debugLogEnabled || process.env.ISYJSDEBUG != undefined && process.env.ISYJSDEBUG != null) {
                // var timeStamp = new Date();
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
        if (familyId === _isyconstants.Families.insteon) {
            // Dimmable Devices
            if (mainType === _isyconstants.Categories.dimmableControl) {
                // Special case fanlinc has a fan element
                if (subType === 46 && subAddress === 2) {
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', _isyconstants.DeviceTypes.fan);
                } else {
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', _isyconstants.DeviceTypes.dimmableLight);
                }
            } else if (mainType === _isyconstants.Categories.relayControl) {
                // Special case appliance Lincs into outlets
                if (subType === 6 || subType === 9 || subType === 12 || subType === 23) {
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', _isyconstants.DeviceTypes.outlet);
                    // Outlet lincs
                } else if (subType === 8 || subType === 33) {
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', _isyconstants.DeviceTypes.outlet);
                    // Dual outlets
                } else if (subType === 57) {
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', _isyconstants.DeviceTypes.outlet);
                } else {
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', _isyconstants.DeviceTypes.light);
                }
                // Sensors
            } else if (mainType === _isyconstants.Categories.sensorActuator) {
                // I/O Lincs
                if (subType === 0) {
                    if (subAddress === 1) {
                        return this.buildDeviceInfoRecord(isyType, 'Insteon', _isyconstants.DeviceTypes.doorWindowSensor);
                    } else {
                        return this.buildDeviceInfoRecord(isyType, 'Insteon', "outlet");
                    }
                    // Other sensors. Not yet supported
                }
                // Access controls/doors/locks
            } else if (mainType === _isyconstants.Categories.accessControl) {
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
            } else if (mainType === _isyconstants.Categories.securityHealthSafety) {
                // Motion sensors
                if (subType === 1 || subType === 3) {
                    if (subAddress === 1) {
                        return this.buildDeviceInfoRecord(isyType, "Insteon", _isyconstants.DeviceTypes.motionSensor);
                        // Ignore battery level sensor and daylight sensor
                    }
                } else if (subType === 2 || subType === 9 || subType === 17) {
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', _isyconstants.DeviceTypes.doorWindowSensor);
                    // Smoke, leak sensors, don't yet know how to support
                }
                // No idea how to test or support
            } else if (mainType === _isyconstants.Categories.climateControl) {
                // Thermostats
                return this.buildDeviceInfoRecord(isyType, "Insteon", _isyconstants.DeviceTypes.thermostat);
            } else if (mainType === 6) {
                // Leak Sensors
                return this.buildDeviceInfoRecord(isyType, "Insteon", _isyconstants.DeviceTypes.leakSensor);
            } else if (mainType === _isyconstants.Categories.controller) {
                if (subType === 6 || subType === 8) {
                    // Insteon Remote
                    return this.buildDeviceInfoRecord(isyType, "Insteon", _isyconstants.DeviceTypes.remote);
                }
            }
            // Z-Wave Device Family
        } else if (familyId === _isyconstants.Families.zWave) {
            // Appears to be all ZWave devices seen so far
            if (mainType === 4) {
                // Identified by user zwave on/off switch
                if (subType === 16) {
                    return this.buildDeviceInfoRecord(isyType, 'ZWave', _isyconstants.DeviceTypes.light);
                    // Identified by user door lock
                } else if (subType === 111) {
                    return this.buildDeviceInfoRecord(isyType, 'ZWave', _isyconstants.DeviceTypes.lock);
                    // This is a guess based on the naming in the ISY SDK
                } else if (subType === 109) {
                    return this.buildDeviceInfoRecord(isyType, 'ZWave', _isyconstants.DeviceTypes.dimmableLight);
                    // Otherwise we don't know how to handle
                }
            }
        } else if (familyId === _isyconstants.Families.poly) {
            // Node Server Node
            if (mainType === 1 && subType === 1) {
                // Node Server Devices are reported as 1.1.0.0.
                return this.buildDeviceInfoRecord(isyType, "NodeServer", _isyconstants.DeviceTypes.polyNode);
            }
            return this.buildDeviceInfoRecord(isyType, "NodeServer", _isyconstants.DeviceTypes.unknown);
        }
    }

    nodeChangedHandler(node, propertyName) {
        var that = this;
        if (this.nodesLoaded) {
            //this.logger(`Node: ${node.address} changed`);
            if (this.changeCallback !== undefined && this.changeCallback !== null) this.changeCallback(that, node, propertyName);
        }
    }

    getElkAlarmPanel() {
        return this.elkAlarmPanel;
    }
    loadNodes(result) {
        this.loadDevices(result);
        this.loadScenes(result);
    }

    loadScenes(result) {
        for (let scene of result.nodes.group) {

            if (scene.name === "ISY") {
                continue;
            } // Skip ISY Scene

            let newScene = new _isyscene.ISYScene(this, scene);
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

            if (!this.deviceMap.has(device.pnode)) {
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
                    if (deviceTypeInfo.deviceType == _isyconstants.DeviceTypes.light) newDevice = new _insteondevice.InsteonSwitchDevice(this, device, deviceTypeInfo);else if (deviceTypeInfo.deviceType == _isyconstants.DeviceTypes.dimmableLight) newDevice = new _insteondevice.InsteonDimmerSwitchDevice(this, device, deviceTypeInfo);else if (deviceTypeInfo.deviceType == _isyconstants.DeviceTypes.doorWindowSensor) {
                        newDevice = new _insteondevice.InsteonDoorWindowSensorDevice(this, device, deviceTypeInfo);
                    } else if (deviceTypeInfo.deviceType == _isyconstants.DeviceTypes.motionSensor) {
                        newDevice = new _insteondevice.InsteonMotionSensorDevice(this, device, deviceTypeInfo);
                    } else if (deviceTypeInfo.deviceType == _isyconstants.DeviceTypes.fan) {
                        newDevice = new _insteondevice.InsteonFanDevice(this, device, deviceTypeInfo);
                    } else if (deviceTypeInfo.deviceType == _isyconstants.DeviceTypes.lock || deviceTypeInfo.deviceType == _isyconstants.DeviceTypes.secureLock) {
                        newDevice = new _insteondevice.InsteonLockDevice(this, device, deviceTypeInfo);
                    } else if (deviceTypeInfo.deviceType == _isyconstants.DeviceTypes.outlet) {
                        newDevice = new _insteondevice.InsteonOutletDevice(this, device, deviceTypeInfo);
                    } else if (deviceTypeInfo.deviceType == _isyconstants.DeviceTypes.thermostat) {
                        newDevice = new _insteondevice.InsteonThermostatDevice(this, device, deviceTypeInfo);
                    }
                    // Support the device with a base device object
                } else {
                    this.logger(`Device: ${device.name} type: ${device.type} is not specifically supported, returning generic device object. `);
                    newDevice = new _isydevice.ISYDevice(this, device);
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
        var document = new _xmldoc.XmlDocument(result);
        var nodes = document.childNamed('areas').childNamed('area').childrenNamed('zone');
        for (var index = 0; index < nodes.length; index++) {
            var id = nodes[index].attr.id;
            var name = nodes[index].attr.name;
            var alarmDef = nodes[index].attr.alarmDef;
            var newDevice = new ElkAlarmSensor(this, name, 1, id, alarmDef == 17 ? this.DEVICE_TYPE_CO_SENSOR : this.DEVICE_TYPE_ALARM_DOOR_WINDOW_SENSOR);
            this.zoneMap[newDevice.zone] = newDevice;
        }
    }

    loadElkInitialStatus(result) {
        var p = new _xml2js.Parser({
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
        if (timeNow - this.lastActivity > 60000) {
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
        return response == null || response instanceof Error || response.statusCode != 200;
    }
    loadVariables(type, done) {
        var that = this;
        var options = {
            username: this.userName,
            password: this.password
        };
        (0, _restler.get)(that.protocol + '://' + that.address + '/rest/vars/definitions/' + type, options).on('complete', (result, response) => {
            if (that.checkForFailure(response)) {
                that.logger("ISY-JS: Error loading variables from isy. Device likely doesn't have any variables defined. Safe to ignore.");
                done();
            } else {
                that.createVariables(type, result);
                (0, _restler.get)(that.protocol + '://' + that.address + '/rest/vars/get/' + type, options).on('complete', (result, response) => {
                    if (that.checkForFailure(response)) {
                        that.logger('ISY-JS: Error loading variables from isy: ' + result.message);
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
        var that = this;

        (0, _restler.get)(`${this.protocol}://${this.address}/rest/config`, this.restlerOptions).on('complete', result => {
            let controls = result.configuration.controls;

            //that.logger(controls.control);
            //var arr = new Array(controls.control);
            for (let ctl of controls.control) {
                this.logger(ctl);
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
        var document = new _xmldoc.XmlDocument(result);
        var variables = document.childrenNamed('e');
        for (var index = 0; index < variables.length; index++) {
            var id = variables[index].attr.id;
            var name = variables[index].attr.name;
            var newVariable = new _isyvariable.ISYVariable(this, id, name, type);
            this.variableList.push(newVariable);
            this.variableIndex[this.createVariableKey(type, id)] = newVariable;
        }
    }
    setVariableValues(result) {
        var document = new _xmldoc.XmlDocument(result);
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

    updateProperties(device, callback) {
        if (!device.initialized) {
            var that = this;
            (0, _restler.get)(`${that.protocol}://${that.address}/rest/nodes/${device.address}/`, that.restlerOptions).on('complete', result => {
                var node = result.nodeInfo.properties;

                if (Array.isArray(node.property)) {
                    //var properties = nodes[index].childrenNamed('property');


                    for (var prop of node.property) {

                        device[prop.id] = Number(prop.value);
                        device.formatted[prop.id] = prop.formatted;
                        device.uom[prop.id] = prop.uom;
                        that.logger(`Property ${Controls[prop.id].label} (${prop.id}) initialized to: ${device[prop.id]} (${device.formatted[prop.id]})`);
                    }
                } else {

                    device[node.property.id] = Number(node.property.value);
                    device.formatted[node.property.id] = node.property.formatted;
                    device.uom[node.property.id] = node.property.uom;
                    that.logger(`Property ${Controls[node.property.id].label} (${node.property.id}) initialized to: ${device[node.property.id]} (${device.formatted[node.property.id]})`);
                }
                device.initialized = true;
                callback();
            }).on('error', (err, response) => {
                that.logger("ISY-JS: Error while contacting ISY" + err);
                throw new Error("Error calling ISY" + err);
            }).on('fail', (data, response) => {
                that.logger("ISY-JS: Error while contacting ISY -- failure");
                throw new Error("Failed calling ISY");
            }).on('abort', () => {
                that.logger("ISY-JS: Abort while contacting ISY");
                throw new Error("Call to ISY was aborted");
            }).on('timeout', ms => {
                that.logger("ISY-JS: Timed out contacting ISY");
                throw new Error("Timeout contacting ISY");
            });
        } else callback();
    }

    initialize(initializeCompleted) {
        this.loadConfig();
        
        let options = {
            username: this.userName,
            password: this.password
        };
        (0, _restler.get)(`${this.protocol}://${this.address}/rest/nodes`, this.restlerOptions).on('complete', result => {
            this.logger(result);
            this.loadNodes(result);
            this.loadVariables(, () => {
                this.loadVariables(that.VARIABLE_TYPE_STATE, () => {
                    if (that.elkEnabled) {
                        (0, _restler.get)(that.protocol + '://' + that.address + '/rest/elk/get/topology', options).on('complete', (result, response) => {
                            if (that.checkForFailure(response)) {
                                that.logger('ISY-JS: Error loading from elk: ' + result.message);
                                throw new Error("Unable to contact the ELK to get the topology");
                            } else {
                                that.loadElkNodes(result);
                                (0, _restler.get)(that.protocol + '://' + that.address + '/rest/elk/get/status', options).on('complete', (result, response) => {
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
        }).on('error', (err, response) => {
            that.logger(`ISY-JS: Error while contacting ISY -- ${err}`);
            throw new Error("Error calling ISY" + err);
        }).on('fail', (data, response) => {
            that.logger("ISY-JS: Error while contacting ISY -- failure");
            throw new Error("Failed calling ISY");
        }).on('abort', () => {
            that.logger("ISY-JS: Abort while contacting ISY");
            throw new Error("Call to ISY was aborted");
        }).on('timeout', ms => {
            that.logger("ISY-JS: Timed out contacting ISY");
            throw new Error("Timeout contacting ISY");
        });
    }

    handleWebSocketMessage(event) {

        this.lastActivity = new Date();
        var p = new _xml2js.Parser({
            explicitArray: false,
            mergeAttrs: true
        });
        p.parseString(event.data, (err, res) => {
            if (err) throw err;

            // Uncomment to print JSON to log for every event received.
            //this.logger(JSON.stringify(res, undefined, 3));

            var evt = res.Event;
            if (evt === undefined || evt.control === undefined) {
                return;
            }

            var eventControl = evt.control;
            if (eventControl.startsWith("GV")) {
                eventControl = "GV";
            } // Catch Generic Values ( GV##, Usually Node Servers)

            var actionValue = 0;

            if (evt.action instanceof Object) {
                actionValue = evt.action._;
            } else if (evt.action instanceof Number || evt.action instanceof String) {
                actionValue = Number(evt.action);
            }

            var formatted = "fmtAct" in evt ? evt.fmtAct : actionValue;

            switch (eventControl) {
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
                case 'GV':
                    // this.logger(JSON.stringify(res, undefined, 3));
                    this.handleISYStateUpdate(evt.node, actionValue, evt.control, formatted);
                    break;

                default:

                    if (evt.node !== "" && evt.node !== undefined && evt.node !== null) {
                        //this.logger(JSON.stringify(res, undefined, 3));
                        this.handleISYStateUpdate(evt.node, actionValue, evt.control, formatted);
                    }
                    break;
            }
        });
    }

    initializeWebSocket() {
        var that = this;
        var auth = 'Basic ' + new Buffer(this.userName + ':' + this.password).toString('base64');
        that.logger('Connecting to: ' + this.wsprotocol + '://' + this.address + '/rest/subscribe');
        this.webSocket = new _websocket.Client(`${this.wsprotocol}://${this.address}/rest/subscribe`, ['ISYSUB'], {
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
            that.logger('ISY-JS: Error while contacting ISY: ' + JSON.stringify(err));
            throw new Error('Error calling ISY' + err);
        }).on('fail', (data, response) => {
            that.logger('ISY-JS: Error while contacting ISY -- failure');
            throw new Error('Failed calling ISY');
        }).on('abort', () => {
            that.logger('ISY-JS: Abort while contacting ISY');
            throw new Error('Call to ISY was aborted');
        }).on('timeout', ms => {
            that.logger('ISY-JS: Timed out contacting ISY');
            throw new Error('Timeout contacting ISY');
        });
    }

    getDeviceList() {
        return this.deviceList;
    }

    getDevice(address) {
        var s = this.deviceIndex[address];
        if (s == null) return this.deviceIndex[address.substr(0, address.length - 1) + '1'];
        return s;
    }

    getScene(address) {
        return this.sceneIndex[address];
    }

    getSceneList() {
        return this.sceneList;
    }

    handleISYStateUpdate(address, state, propertyName, formattedState) {

        var deviceToUpdate = this.getDevice(address);
        var subAddress = address[address.length - 1];
        if (deviceToUpdate != undefined && deviceToUpdate != null) {
            this.updateProperties(deviceToUpdate, () => {
                if (propertyName in deviceToUpdate) {
                    if (deviceToUpdate.handleIsyUpdate(state, propertyName, formattedState, subAddress)) {
                        this.nodeChangedHandler(deviceToUpdate, propertyName);
                    }
                }
            });
        }
    }

    sendISYCommand(path, handleResult) {
        var uriToUse = `${this.protocol}://${this.address}/rest/${path}`;
        this.logger("ISY-JS: Sending ISY command..." + uriToUse);
        var options = {
            username: this.userName,
            password: this.password
        };
        (0, _restler.get)(uriToUse, options).on('complete', (data, response) => {
            if (response.statusCode == 200) {
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
        this.logger(`ISY-JS: Sending command...${uriToUse}`);
        var options = {
            username: this.userName,
            password: this.password
        };
        (0, _restler.get)(uriToUse, options).on('complete', (data, response) => {
            if (response.statusCode == 200) {
                handleResult(true);
            } else {
                handleResult(false);
            }
        });
    }

    sendGetVariable(id, type, handleResult) {
        var uriToUse = `${this.protocol}://${this.address}/rest/vars/get/${type}/${id}`;
        this.logger(`ISY-JS: Sending ISY command...${uriToUse}`);
        var options = {
            username: this.userName,
            password: this.password
        };
        (0, _restler.get)(uriToUse, options).on('complete', (result, response) => {
            if (response.statusCode == 200) {
                var document = new _xmldoc.XmlDocument(result);
                var val = parseInt(document.childNamed('val').val);
                var init = parseInt(document.childNamed('init').val);
                handleResult(val, init);
            }
        });
    }
    sendSetVariable(id, type, value, handleResult) {
        var uriToUse = `${this.protocol}://${this.address}/rest/vars/set/${type}/${id}/${value}`;
        this.logger(`ISY-JS: Sending ISY command...${uriToUse}`);
        var options = {
            username: this.userName,
            password: this.password
        };
        (0, _restler.get)(uriToUse, options).on('complete', (result, response) => {
            if (response.statusCode == 200) {
                handleResult(true);
            } else {
                handleResult(false);
            }
        });
    }
}
exports.ISY = ISY;