"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const faye_websocket_1 = require("faye-websocket");
const fs_1 = require("fs");
const restler_1 = require("restler");
const processors_1 = require("xml2js/lib/processors");
const xml2js_1 = require("xml2js");
const xmldoc_1 = require("xmldoc");
const elkdevice_1 = require("./elkdevice");
exports.ELKAlarmPanelDevice = elkdevice_1.ELKAlarmPanelDevice;
exports.ElkAlarmSensorDevice = elkdevice_1.ElkAlarmSensorDevice;
const insteondevice_1 = require("./insteondevice");
exports.InsteonBaseDevice = insteondevice_1.InsteonBaseDevice;
exports.InsteonDimmableDevice = insteondevice_1.InsteonDimmableDevice;
exports.InsteonDimmerSwitchDevice = insteondevice_1.InsteonDimmerSwitchDevice;
exports.InsteonDoorWindowSensorDevice = insteondevice_1.InsteonDoorWindowSensorDevice;
exports.InsteonFanDevice = insteondevice_1.InsteonFanDevice;
exports.InsteonLockDevice = insteondevice_1.InsteonLockDevice;
exports.InsteonMotionSensorDevice = insteondevice_1.InsteonMotionSensorDevice;
exports.InsteonOutletDevice = insteondevice_1.InsteonOutletDevice;
exports.InsteonRelayDevice = insteondevice_1.InsteonRelayDevice;
exports.InsteonSwitchDevice = insteondevice_1.InsteonSwitchDevice;
exports.InsteonThermostatDevice = insteondevice_1.InsteonThermostatDevice;
const isyconstants_1 = require("./isyconstants");
exports.Categories = isyconstants_1.Categories;
exports.DeviceTypes = isyconstants_1.DeviceTypes;
exports.Families = isyconstants_1.Families;
exports.NodeTypes = isyconstants_1.NodeTypes;
exports.Props = isyconstants_1.Props;
exports.States = isyconstants_1.States;
const isydevice_1 = require("./isydevice");
exports.ISYDevice = isydevice_1.ISYDevice;
const isynode_1 = require("./isynode");
exports.ISYNode = isynode_1.ISYNode;
const ProductInfoData = require("./isyproductinfo.json");
const isyscene_1 = require("./isyscene");
exports.ISYScene = isyscene_1.ISYScene;
const isyvariable_1 = require("./isyvariable");
exports.ISYVariable = isyvariable_1.ISYVariable;
const utils_1 = require("./utils");
const parser = new xml2js_1.Parser({
    explicitArray: false,
    mergeAttrs: true
});
exports.Controls = {};
const ProductInfo = ProductInfoData;
class ISY {
    constructor(address, username, password, elkEnabled, changeCallback, useHttps, scenesInDeviceList, enableDebugLogging, variableCallback, log) {
        this.deviceList = new Map();
        this.deviceMap = new Map();
        this.sceneList = new Map();
        this.folderMap = new Map();
        this.productInfoList = new Map();
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
            parser: restler_1.parsers.xml,
            xml2js: {
                explicitArray: false,
                mergeAttrs: true,
                attrValueProcessors: [processors_1.parseBooleans, processors_1.parseNumbers],
                valueProcessors: [processors_1.parseNumbers, processors_1.parseBooleans]
            }
        };
        // this.deviceMap = new Map();
        this.variableList = [];
        this.variableIndex = {};
        this.variableCallback = variableCallback;
        this.nodesLoaded = false;
        this.protocol = useHttps === true ? 'https' : 'http';
        this.wsprotocol = 'ws';
        this.elkEnabled = elkEnabled;
        this.zoneMap = {};
        this.debugLogEnabled =
            enableDebugLogging === undefined ? false : enableDebugLogging;
        this.scenesInDeviceList =
            scenesInDeviceList === undefined ? false : scenesInDeviceList;
        this.guardianTimer = null;
        if (this.elkEnabled) {
            this.elkAlarmPanel = new elkdevice_1.ELKAlarmPanelDevice(this, 1, null);
        }
        this.changeCallback = changeCallback;
        if (log === undefined) {
            this.log = (msg) => {
                const timeStamp = new Date();
                // tslint:disable-next-line:no-console
                console.log(`${timeStamp.getFullYear()}-${timeStamp.getMonth()}-${timeStamp.getDay()}#${timeStamp.getHours()}:${timeStamp.getMinutes()}:${timeStamp.getSeconds()}- ${msg}`);
            };
        }
        else {
            this.log = log;
        }
        this.logger = (msg) => {
            if (this.debugLogEnabled ||
                (process.env.ISYJSDEBUG !== undefined &&
                    process.env.ISYJSDEBUG !== null)) {
                this.log(msg);
            }
        };
        for (const p of ProductInfo) {
            this.logger(p);
            if (p.address !== '' && p.address !== undefined && p.address !== null) {
                this.productInfoList.set(`${p.type} ${String(p.address)}`, p);
            }
            else {
                this.productInfoList.set(p.type, p);
            }
        }
        this.logger(JSON.stringify(this.productInfoList.size));
    }
    buildDeviceInfoRecord(isyType, connectionType, deviceType) {
        return {
            type: isyType,
            address: '',
            name: 'Generic Device',
            deviceType,
            connectionType,
            batteryOperated: false
        };
    }
    isyTypeToTypeName(isyType, address) {
        if (this.productInfoList.has(isyType)) {
            const t = this.productInfoList.get(isyType);
            // this.logger(JSON.stringify(t));
            return t;
        }
        else {
            // this.logger(JSON.stringify(isyType));
            return this.productInfoList.get(`${isyType} ${address.split(' ')[3]}`);
        }
        return null;
    }
    async callISY(url) {
        url = `${this.protocol}://${this.address}/rest/${url}/`;
        this.logger(`Sending request: ${url}`);
        const p = await utils_1.getAsync(url, this.restlerOptions).then((response) => {
            if (this.checkForFailure(response)) {
                this.logger(`Error calling ISY: ${JSON.stringify(response)}`);
                return Promise.reject(response);
            }
            return response;
        }, Promise.reject);
        return p;
    }
    getDeviceTypeBasedOnISYTable(deviceNode) {
        let familyId = 1;
        if (deviceNode.family !== null) {
            familyId = Number(deviceNode.family);
        }
        const isyType = deviceNode.type;
        const addressData = deviceNode.address;
        const addressElements = addressData.split(' ');
        const typeElements = isyType.split('.');
        const mainType = Number(typeElements[0]);
        let subType = Number(typeElements[1]);
        const subAddress = Number(addressElements[3]);
        // this.logger(JSON.stringify(deviceNode));
        // ZWave nodes identify themselves with devtype node
        if (deviceNode.devtype !== null && deviceNode.devtype !== undefined) {
            if (deviceNode.devtype.cat !== null) {
                subType = Number(deviceNode.devtype.cat);
            }
        }
        // Insteon Device Family
        if (familyId === isyconstants_1.Families.Insteon) {
            // Dimmable Devices
            if (mainType === isyconstants_1.Categories.DimmableControl) {
                // Special case fanlinc has a fan element
                if (subType === 46 && subAddress === 2) {
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', isyconstants_1.DeviceTypes.fan);
                }
                else {
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', isyconstants_1.DeviceTypes.dimmableLight);
                }
            }
            else if (mainType === isyconstants_1.Categories.RelayControl) {
                // Special case appliance Lincs into outlets
                if (subType in [6, 7, 12, 23]) {
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', isyconstants_1.DeviceTypes.outlet);
                    // Outlet lincs
                }
                else if (subType === 8 || subType === 33) {
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', isyconstants_1.DeviceTypes.outlet);
                    // Dual outlets
                }
                else if (subType === 57) {
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', isyconstants_1.DeviceTypes.outlet);
                }
                else {
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', isyconstants_1.DeviceTypes.light);
                }
                // Sensors
            }
            else if (mainType === isyconstants_1.Categories.SensorActuator) {
                // I/O Lincs
                if (subType === 0) {
                    if (subAddress === 1) {
                        return this.buildDeviceInfoRecord(isyType, 'Insteon', isyconstants_1.DeviceTypes.doorWindowSensor);
                    }
                    else {
                        return this.buildDeviceInfoRecord(isyType, 'Insteon', 'outlet');
                    }
                    // Other sensors. Not yet supported
                }
                // Access controls/doors/locks
            }
            else if (mainType === isyconstants_1.Categories.AccessControl) {
                // MorningLinc
                if (subType === 6) {
                    if (subAddress === 1) {
                        return this.buildDeviceInfoRecord(isyType, 'Insteon', 'lock');
                        // Ignore subdevice which operates opposite for the locks
                    }
                    else {
                        return null;
                    }
                    // Other devices, going to guess they are similar to MorningLinc
                }
            }
            else if (mainType === isyconstants_1.Categories.SecurityHealthSafety) {
                // Motion sensors
                if (subType === 1 || subType === 3 || subType === 22) {
                    if (subAddress === 1) {
                        return this.buildDeviceInfoRecord(isyType, 'Insteon', isyconstants_1.DeviceTypes.motionSensor);
                        // Ignore battery level sensor and daylight sensor
                    }
                }
                else if (subType === 2 || subType === 9 || subType === 17) {
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', isyconstants_1.DeviceTypes.doorWindowSensor);
                    // Smoke, leak sensors, don't yet know how to support
                }
                // No idea how to test or support
            }
            else if (mainType === isyconstants_1.Categories.ClimateControl) {
                // Thermostats
                return this.buildDeviceInfoRecord(isyType, 'Insteon', isyconstants_1.DeviceTypes.thermostat);
            }
            else if (mainType === 6) {
                // Leak Sensors
                return this.buildDeviceInfoRecord(isyType, 'Insteon', isyconstants_1.DeviceTypes.leakSensor);
            }
            else if (mainType === isyconstants_1.Categories.Controller) {
                if (subType === 6 || subType === 8) {
                    // Insteon Remote
                    return this.buildDeviceInfoRecord(isyType, 'Insteon', isyconstants_1.DeviceTypes.remote);
                }
            }
            // Z-Wave Device Family
        }
        else if (familyId === isyconstants_1.Families.ZWave) {
            // Appears to be all ZWave devices seen so far
            if (mainType === 4) {
                // Identified by user zwave on/off switch
                if (subType === 16) {
                    return this.buildDeviceInfoRecord(isyType, 'ZWave', isyconstants_1.DeviceTypes.light);
                    // Identified by user door lock
                }
                else if (subType === 111) {
                    return this.buildDeviceInfoRecord(isyType, 'ZWave', isyconstants_1.DeviceTypes.lock);
                    // This is a guess based on the naming in the ISY SDK
                }
                else if (subType === 109) {
                    return this.buildDeviceInfoRecord(isyType, 'ZWave', isyconstants_1.DeviceTypes.dimmableLight);
                    // Otherwise we don't know how to handle
                }
            }
        }
        else if (familyId === isyconstants_1.Families.Poly) {
            // Node Server Node
            if (mainType === 1 && subType === 1) {
                // Node Server Devices are reported as 1.1.0.0.
                return this.buildDeviceInfoRecord(isyType, 'NodeServer', isyconstants_1.DeviceTypes.polyNode);
            }
            return this.buildDeviceInfoRecord(isyType, 'Unknown', isyconstants_1.DeviceTypes.unknown);
        }
    }
    nodeChangedHandler(node, propertyName = null) {
        const that = this;
        if (this.nodesLoaded) {
            // this.logger(`Node: ${node.address} changed`);
            if (this.changeCallback !== undefined && this.changeCallback !== null) {
                this.changeCallback(that, node, propertyName);
            }
        }
    }
    getElkAlarmPanel() {
        return this.elkAlarmPanel;
    }
    async loadNodes() {
        const result = await this.callISY('nodes');
        if (this.debugLogEnabled) {
            fs_1.writeFile('ISYNodesDump.json', JSON.stringify(result), this.logger);
        }
        this.loadFolders(result);
        this.loadDevices(result);
        this.loadScenes(result);
    }
    loadFolders(result) {
        this.logger('Loading Folders');
        for (const folder of result.nodes.folder) {
            this.logger(`Loading: ${JSON.stringify(folder)}`);
            this.folderMap.set(folder.address, folder.name);
        }
    }
    loadScenes(result) {
        this.logger('Loading Scenes');
        for (const scene of result.nodes.group) {
            if (scene.name === 'ISY' || scene.name === 'Auto DR') {
                continue;
            } // Skip ISY & Auto DR Scenes
            const newScene = new isyscene_1.ISYScene(this, scene);
            this.sceneList.set(newScene.address, newScene);
        }
    }
    loadDevices(obj) {
        this.logger('Loading Devices');
        for (const device of obj.nodes.node) {
            if (!this.deviceMap.has(device.pnode)) {
                const address = device.address;
                this.deviceMap[device.pnode] = {
                    address
                };
            }
            else {
                this.deviceMap[device.pnode].push(device.address);
            }
            let newDevice = null;
            let deviceTypeInfo = this.isyTypeToTypeName(device.type, device.address);
            // this.logger(JSON.stringify(deviceTypeInfo));
            const enabled = Boolean(device.enabled);
            if (enabled) {
                // Try fallback to new generic device identification when not specifically identified.
                if (deviceTypeInfo === null || deviceTypeInfo === undefined) {
                    deviceTypeInfo = this.getDeviceTypeBasedOnISYTable(device);
                }
                if (deviceTypeInfo !== null && deviceTypeInfo !== undefined) {
                    if (deviceTypeInfo.deviceType === isyconstants_1.DeviceTypes.light) {
                        newDevice = new insteondevice_1.InsteonRelayDevice(this, device, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType === isyconstants_1.DeviceTypes.dimmableLight) {
                        newDevice = new insteondevice_1.InsteonDimmableDevice(this, device, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType === isyconstants_1.DeviceTypes.doorWindowSensor) {
                        newDevice = new insteondevice_1.InsteonDoorWindowSensorDevice(this, device, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType === isyconstants_1.DeviceTypes.motionSensor) {
                        newDevice = new insteondevice_1.InsteonMotionSensorDevice(this, device, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType === isyconstants_1.DeviceTypes.leakSensor) {
                        newDevice = new insteondevice_1.InsteonLeakSensorDevice(this, device, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType === isyconstants_1.DeviceTypes.fan) {
                        newDevice = new insteondevice_1.InsteonFanDevice(this, device, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType === isyconstants_1.DeviceTypes.lock ||
                        deviceTypeInfo.deviceType === isyconstants_1.DeviceTypes.secureLock) {
                        newDevice = new insteondevice_1.InsteonLockDevice(this, device, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType === isyconstants_1.DeviceTypes.outlet) {
                        newDevice = new insteondevice_1.InsteonOutletDevice(this, device, deviceTypeInfo);
                    }
                    else if (deviceTypeInfo.deviceType === isyconstants_1.DeviceTypes.thermostat) {
                        newDevice = new insteondevice_1.InsteonThermostatDevice(this, device, deviceTypeInfo);
                    }
                    this.logger(`Device ${newDevice.productName} named ${newDevice.name} added as ${newDevice.constructor.name}.`);
                    // Support the device with a base device object
                }
                else {
                    this.logger(`Device ${device.name} with type: ${device.type} and nodedef: ${device.nodeDefId} is not specifically supported, returning generic device object. `);
                    newDevice = new isydevice_1.ISYDevice(this, device);
                }
                if (newDevice !== null) {
                    this.deviceList.set(newDevice.address, newDevice);
                    // this.deviceList.push(newDevice);
                }
            }
            else {
                this.logger(`Ignoring disabled device: ${device.name}`);
            }
        }
        this.logger(`Devices: ${this.deviceList.entries.length} added.`);
    }
    loadElkNodes(result) {
        const document = new xmldoc_1.XmlDocument(result);
        const nodes = document
            .childNamed('areas')
            .childNamed('area')
            .childrenNamed('zone');
        for (let index = 0; index < nodes.length; index++) {
            const id = nodes[index].attr.id;
            const name = nodes[index].attr.name;
            const alarmDef = nodes[index].attr.alarmDef;
            const newDevice = new elkdevice_1.ElkAlarmSensorDevice(this, name, 1, id, alarmDef === 17
                ? isyconstants_1.DeviceTypes.alarmDoorWindowSensor
                : isyconstants_1.DeviceTypes.coSensor);
            this.zoneMap[newDevice.zone] = newDevice;
        }
    }
    loadElkInitialStatus(result) {
        const p = new xml2js_1.Parser({
            explicitArray: false,
            mergeAttrs: true
        });
        p.parseString(result, (err, res) => {
            if (err) {
                throw err;
            }
            for (const nodes of res.ae) {
                this.elkAlarmPanel.setFromAreaUpdate(nodes);
            }
            for (const nodes of res.ze) {
                const id = nodes.zone;
                const zoneDevice = this.zoneMap[id];
                if (zoneDevice !== null) {
                    zoneDevice.setFromZoneUpdate(nodes);
                    if (this.deviceList[zoneDevice.address] === null &&
                        zoneDevice.isPresent()) {
                        this.deviceList[zoneDevice.address] = zoneDevice;
                        // this.deviceIndex[zoneDevice.address] = zoneDevice;
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
                this.deviceList[this.elkAlarmPanel.address] = this.elkAlarmPanel;
            }
            this.guardianTimer = setInterval(this.guardian.bind(this), 60000);
            this.initializeWebSocket();
        }
    }
    guardian() {
        const timeNow = new Date();
        if (Number(timeNow) - Number(this.lastActivity) > 60000) {
            this.logger('Guardian: Detected no activity in more then 60 seconds. Reinitializing web sockets');
            this.initializeWebSocket();
        }
    }
    variableChangedHandler(variable) {
        this.logger(`Variable:${variable.id} (${variable.type}) changed`);
        if (this.variableCallback !== null && this.variableCallback !== undefined) {
            this.variableCallback(this, variable);
        }
    }
    checkForFailure(response) {
        return (response === null ||
            response instanceof Error ||
            response.RestResponse !== undefined && response.RestResponse.status !== '200');
    }
    loadVariables(type, done) {
        const that = this;
        const options = {
            username: this.userName,
            password: this.password
        };
        restler_1.get(`${that.protocol}://${that.address}/rest/vars/definitions/${type}`, options).on('complete', (result, response) => {
            if (that.checkForFailure(response)) {
                that.logger('Error loading variables from isy. Device likely doesn\'t have any variables defined. Safe to ignore.');
                done();
            }
            else {
                that.createVariables(type, result);
                restler_1.get(`${that.protocol}://${that.address}/rest/vars/get/${type}`, options).on('complete', (result, response) => {
                    if (that.checkForFailure(response)) {
                        that.logger(`Error loading variables from isy: ${result.message}`);
                        throw new Error('Unable to load variables from the ISY');
                    }
                    else {
                        that.setVariableValues(result);
                    }
                    done();
                });
            }
        });
    }
    async loadConfig() {
        const result = await this.callISY('config');
        if (this.debugLogEnabled) {
            fs_1.writeFile('ISYConfigDump.json', JSON.stringify(result), this.logger);
        }
        const controls = result.configuration.controls;
        // this.logger(result.configuration);
        if (controls !== undefined) {
            // this.logger(controls.control);
            // var arr = new Array(controls.control);
            for (const ctl of controls.control) {
                // this.logger(ctl);
                exports.Controls[ctl.name] = ctl;
            }
        }
    }
    getVariableList() {
        return this.variableList;
    }
    getVariable(type, id) {
        const key = this.createVariableKey(type, id);
        if (this.variableIndex[key] !== null &&
            this.variableIndex[key] !== undefined) {
            return this.variableIndex[key];
        }
        return null;
    }
    handleISYVariableUpdate(id, type, value, ts) {
        const variableToUpdate = this.getVariable(type, id);
        if (variableToUpdate !== null) {
            variableToUpdate.value = value;
            variableToUpdate.lastChanged = ts;
            this.variableChangedHandler(variableToUpdate);
        }
    }
    createVariableKey(type, id) {
        return type + ':' + id;
    }
    createVariables(type, result) {
        const document = new xmldoc_1.XmlDocument(result);
        const variables = document.childrenNamed('e');
        for (let index = 0; index < variables.length; index++) {
            const id = variables[index].attr.id;
            const name = variables[index].attr.name;
            const newVariable = new isyvariable_1.ISYVariable(this, id, name, type);
            this.variableList.push(newVariable);
            this.variableIndex[this.createVariableKey(type, id)] = newVariable;
        }
    }
    setVariableValues(result) {
        const document = new xmldoc_1.XmlDocument(result);
        const variables = document.childrenNamed('var');
        for (let index = 0; index < variables.length; index++) {
            const variableNode = variables[index];
            const id = variableNode.attr.id;
            const type = variableNode.attr.type;
            const init = parseInt(variableNode.childNamed('init').val);
            const value = parseInt(variableNode.childNamed('val').val);
            const ts = variableNode.childNamed('ts').val;
            const variable = this.getVariable(type, id);
            if (variable !== null) {
                variable.value = value;
                variable.init = init;
                variable.lastChanged = new Date(ts);
            }
        }
    }
    getNodeDetail(device, callback) {
        restler_1.get(`${this.protocol}://${this.address}/rest/nodes/${device.address}/`, this.restlerOptions)
            .on('complete', (result) => {
            const nodeDetail = result.nodeInfo;
            callback(nodeDetail);
        })
            .on('error', (err, response) => {
            this.logger('Error while contacting ISY' + err);
            throw new Error('Error calling ISY' + err);
        })
            .on('fail', (data, response) => {
            this.logger('Error while contacting ISY -- failure');
            throw new Error('Failed calling ISY');
        })
            .on('abort', () => {
            this.logger('Abort while contacting ISY');
            throw new Error('Call to ISY was aborted');
        })
            .on('timeout', (ms) => {
            this.logger('Timed out contacting ISY');
            throw new Error('Timeout contacting ISY');
        });
    }
    async refreshStatuses() {
        const that = this;
        const result = await this.callISY('status');
        // this.logger(JSON.stringify(result.nodes.node));
        for (const node of result.nodes.node) {
            // this.logger(node);
            const device = that.getDevice(node.id);
            if (Array.isArray(node.property)) {
                for (const prop of node.property) {
                    device[prop.id] = Number(prop.value);
                    device.formatted[prop.id] = prop.formatted;
                    device.uom[prop.id] = prop.uom;
                    device.logger(`Property ${exports.Controls[prop.id].label} (${prop.id}) initialized to: ${device[prop.id]} (${device.formatted[prop.id]})`);
                }
            }
            else {
                device[node.property.id] = Number(node.property.value);
                device.formatted[node.property.id] = node.property.formatted;
                device.uom[node.property.id] = node.property.uom;
                device.logger(`Property ${exports.Controls[node.property.id].label} (${node.property.id}) initialized to: ${device[node.property.id]} (${device.formatted[node.property.id]})`);
            }
        }
    }
    initialize(initializeCompleted) {
        const that = this;
        const options = {
            username: this.userName,
            password: this.password
        };
        this.loadConfig()
            .then(this.loadNodes.bind(this))
            .finally(() => this.refreshStatuses().finally(() => {
            this.loadVariables(isyconstants_1.VariableTypes.Integer, () => {
                this.loadVariables(isyconstants_1.VariableTypes.State, () => {
                    if (this.elkEnabled) {
                        restler_1.get(`${this.protocol}://${that.address}/rest/elk/get/topology`, options).on('complete', (result, response) => {
                            if (that.checkForFailure(response)) {
                                that.logger('Error loading from elk: ' + result.message);
                                throw new Error('Unable to contact the ELK to get the topology');
                            }
                            else {
                                that.loadElkNodes(result);
                                restler_1.get(`${that.protocol}://${that.address}/rest/elk/get/status`, options).on('complete', (result, response) => {
                                    if (that.checkForFailure(response)) {
                                        that.logger(`Error:${result.message}`);
                                        throw new Error('Unable to get the status from the elk');
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
                        this.finishInitialize(true, initializeCompleted);
                    }
                });
            });
        }))
            .catch((reason) => this.logger('Error initializing ISY: ' + JSON.stringify(reason)));
    }
    handleWebSocketMessage(event) {
        this.lastActivity = new Date();
        parser.parseString(event.data, (err, res) => {
            if (err) {
                throw err;
            }
            const evt = res.Event;
            if (evt === undefined || evt.control === undefined) {
                return;
            }
            let actionValue = 0;
            if (evt.action instanceof Object) {
                actionValue = evt.action._;
            }
            else if (evt.action instanceof Number || evt.action instanceof String) {
                actionValue = Number(evt.action);
            }
            switch (evt.control) {
                case '_19':
                    if (actionValue === 2) {
                        const aeElement = evt.eventInfo.ae;
                        if (aeElement !== null) {
                            if (this.elkAlarmPanel.setFromAreaUpdate(aeElement)) {
                                this.nodeChangedHandler(this.elkAlarmPanel);
                            }
                        }
                    }
                    else if (actionValue === 3) {
                        const zeElement = evt.eventInfo.ze;
                        const zoneId = zeElement.zone;
                        const zoneDevice = this.zoneMap[zoneId];
                        if (zoneDevice !== null) {
                            if (zoneDevice.setFromZoneUpdate(zeElement)) {
                                this.nodeChangedHandler(zoneDevice);
                            }
                        }
                    }
                    break;
                case '_1':
                    if (actionValue === 6) {
                        const varNode = evt.eventInfo.var;
                        if (varNode !== null) {
                            const id = varNode.id;
                            const type = varNode.type;
                            const val = parseInt(varNode.val);
                            const year = parseInt(varNode.ts.substr(0, 4));
                            const month = parseInt(varNode.ts.substr(4, 2));
                            const day = parseInt(varNode.ts.substr(6, 2));
                            const hour = parseInt(varNode.ts.substr(9, 2));
                            const min = parseInt(varNode.ts.substr(12, 2));
                            const sec = parseInt(varNode.ts.substr(15, 2));
                            const timeStamp = new Date(year, month, day, hour, min, sec);
                            this.handleISYVariableUpdate(id, type, val, timeStamp);
                        }
                    }
                    break;
                default:
                    if (evt.node !== '' && evt.node !== undefined && evt.node !== null) {
                        //
                        const impactedDevice = this.getDevice(evt.node);
                        if (impactedDevice !== undefined && impactedDevice !== null) {
                            impactedDevice.handleEvent(evt);
                        }
                        else {
                            this.logger(JSON.stringify(evt));
                        }
                    }
                    break;
            }
        });
    }
    initializeWebSocket() {
        const that = this;
        const auth = `Basic ${new Buffer(`${this.userName}:${this.password}`).toString('base64')}`;
        that.logger(`Connecting to: ${this.wsprotocol}://${this.address}/rest/subscribe`);
        this.webSocket = new faye_websocket_1.Client(`${this.wsprotocol}://${this.address}/rest/subscribe`, ['ISYSUB'], {
            headers: {
                Origin: 'com.universal-devices.websockets.isy',
                Authorization: auth
            },
            ping: 10
        });
        this.lastActivity = new Date();
        this.webSocket
            .on('message', (event) => {
            that.handleWebSocketMessage(event);
        })
            .on('error', (err, response) => {
            that.logger(`Websocket subscription error: ${err}`);
            /// throw new Error('Error calling ISY' + err);
        })
            .on('fail', (data, response) => {
            that.logger(`Websocket subscription failure: ${data}`);
            throw new Error('Failed calling ISY');
        })
            .on('abort', () => {
            that.logger('Websocket subscription aborted.');
            throw new Error('Call to ISY was aborted');
        })
            .on('timeout', (ms) => {
            that.logger(`Websocket subscription timed out after ${ms} milliseconds.`);
            throw new Error('Timeout contacting ISY');
        });
    }
    getDevice(address, parentsOnly = false) {
        let s = this.deviceList.get(address);
        if (!parentsOnly) {
            if (s === null) {
                return this.deviceList[`${address.substr(0, address.length - 1)}1`];
            }
        }
        else {
            while (s.parentAddress !== undefined &&
                s.parentAddress !== s.address &&
                s.parentAddress !== null) {
                s = this.deviceList[s.parentAddress];
            }
        }
        return s;
    }
    getScene(address) {
        return this.sceneList[address];
    }
    async sendISYCommand(path) {
        // const uriToUse = `${this.protocol}://${this.address}/rest/${path}`;
        this.logger(`Sending command...${path}`);
        return this.callISY(path);
    }
    async sendNodeCommand(node, command, ...parameters) {
        let uriToUse = `nodes/${node.address}/cmd/${command}`;
        if (parameters !== null &&
            parameters !== undefined &&
            parameters.length > 0) {
            uriToUse += `/${parameters.join('/')}`;
        }
        this.logger(`${node.name}: sending ${command} command: ${uriToUse}`);
        return this.callISY(uriToUse);
    }
    sendGetVariable(id, type, handleResult) {
        const uriToUse = `${this.protocol}://${this.address}/rest/vars/get/${type}/${id}`;
        this.logger(`Sending ISY command...${uriToUse}`);
        const options = {
            username: this.userName,
            password: this.password
        };
        restler_1.get(uriToUse, options).on('complete', (result, response) => {
            if (response.statusCode === 200) {
                const document = new xmldoc_1.XmlDocument(result);
                const val = parseInt(document.childNamed('val').val);
                const init = parseInt(document.childNamed('init').val);
                handleResult(val, init);
            }
        });
    }
    sendSetVariable(id, type, value, handleResult) {
        const uriToUse = `${this.protocol}://${this.address}/rest/vars/set/${type}/${id}/${value}`;
        this.logger(`Sending ISY command...${uriToUse}`);
        const options = {
            username: this.userName,
            password: this.password
        };
        restler_1.get(uriToUse, options).on('complete', (result, response) => {
            if (response.statusCode === 200) {
                handleResult(true);
            }
            else {
                handleResult(false);
            }
        });
    }
}
exports.ISY = ISY;
