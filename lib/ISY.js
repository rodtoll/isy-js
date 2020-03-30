Object.defineProperty(exports, "__esModule", { value: true });
const faye_websocket_1 = require("faye-websocket");
const fs_1 = require("fs");
const restler_1 = require("restler");
const xml2js_1 = require("xml2js");
const processors_1 = require("xml2js/lib/processors");
const xmldoc_1 = require("xmldoc");
const Categories_1 = require("./Categories");
exports.Categories = Categories_1.Categories;
const DeviceFactory_1 = require("./DeviceFactory");
const ElkAlarmPanelDevice_1 = require("./Devices/Elk/ElkAlarmPanelDevice");
exports.ELKAlarmPanelDevice = ElkAlarmPanelDevice_1.ELKAlarmPanelDevice;
exports.ElkAlarmSensorDevice = ElkAlarmPanelDevice_1.ElkAlarmSensorDevice;
const InsteonBaseDevice_1 = require("./Devices/Insteon/InsteonBaseDevice");
exports.InsteonBaseDevice = InsteonBaseDevice_1.InsteonBaseDevice;
const InsteonDevice_1 = require("./Devices/Insteon/InsteonDevice");
exports.InsteonOutletDevice = InsteonDevice_1.InsteonOutletDevice;
exports.InsteonSwitchDevice = InsteonDevice_1.InsteonSwitchDevice;
const InsteonDimmableDevice_1 = require("./Devices/Insteon/InsteonDimmableDevice");
exports.InsteonDimmableDevice = InsteonDimmableDevice_1.InsteonDimmableDevice;
const InsteonDimmerSwitchDevice_1 = require("./Devices/Insteon/InsteonDimmerSwitchDevice");
exports.InsteonDimmerSwitchDevice = InsteonDimmerSwitchDevice_1.InsteonDimmerSwitchDevice;
const InsteonDoorWindowSensorDevice_1 = require("./Devices/Insteon/InsteonDoorWindowSensorDevice");
exports.InsteonDoorWindowSensorDevice = InsteonDoorWindowSensorDevice_1.InsteonDoorWindowSensorDevice;
const InsteonFanDevice_1 = require("./Devices/Insteon/InsteonFanDevice");
exports.InsteonFanDevice = InsteonFanDevice_1.InsteonFanDevice;
exports.InsteonFanMotorDevice = InsteonFanDevice_1.InsteonFanMotorDevice;
const InsteonLockDevice_1 = require("./Devices/Insteon/InsteonLockDevice");
exports.InsteonLockDevice = InsteonLockDevice_1.InsteonLockDevice;
const InsteonMotionSensorDevice_1 = require("./Devices/Insteon/InsteonMotionSensorDevice");
exports.InsteonMotionSensorDevice = InsteonMotionSensorDevice_1.InsteonMotionSensorDevice;
const InsteonRelayDevice_1 = require("./Devices/Insteon/InsteonRelayDevice");
exports.InsteonRelayDevice = InsteonRelayDevice_1.InsteonRelayDevice;
const InsteonThermostatDevice_1 = require("./Devices/Insteon/InsteonThermostatDevice");
exports.InsteonThermostatDevice = InsteonThermostatDevice_1.InsteonThermostatDevice;
const ISYDevice_1 = require("./Devices/ISYDevice");
exports.ISYDevice = ISYDevice_1.ISYDevice;
const Families_1 = require("./Families");
exports.Family = Families_1.Family;
const ISYConstants_1 = require("./ISYConstants");
exports.DeviceTypes = ISYConstants_1.DeviceTypes;
exports.NodeType = ISYConstants_1.NodeType;
exports.Props = ISYConstants_1.Props;
exports.States = ISYConstants_1.States;
const ISYNode_1 = require("./ISYNode");
exports.ISYNode = ISYNode_1.ISYNode;
const ProductInfoData = require("./isyproductinfo.json");
const ISYScene_1 = require("./ISYScene");
exports.ISYScene = ISYScene_1.ISYScene;
const ISYVariable_1 = require("./ISYVariable");
exports.ISYVariable = ISYVariable_1.ISYVariable;
const Utils_1 = require("./Utils");
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
        this.nodesLoaded = false;
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
            this.elkAlarmPanel = new ElkAlarmPanelDevice_1.ELKAlarmPanelDevice(this, 1, null);
        }
        this.changeCallback = changeCallback;
        log === undefined ? this.log = (msg) => {
            const timeStamp = new Date();
            // tslint:disable-next-line:no-console
            console.log(`${timeStamp.getFullYear()}-${timeStamp.getMonth()}-${timeStamp.getDay()}#${timeStamp.getHours()}:${timeStamp.getMinutes()}:${timeStamp.getSeconds()}- ${msg}`);
        } : this.log = log;
        this.logger = (msg) => {
            if (this.debugLogEnabled ||
                (process.env.ISYJSDEBUG !== undefined &&
                    process.env.ISYJSDEBUG !== null)) {
                this.log(msg);
            }
            else {
                console.log(msg);
            }
        };
    }
    async callISY(url) {
        url = `${this.protocol}://${this.address}/rest/${url}/`;
        this.logger(`Sending request: ${url}`);
        try {
            const response = await Utils_1.getAsync(url, this.restlerOptions);
            if (this.checkForFailure(response)) {
                //this.logger(`Error calling ISY: ${JSON.stringify(response)}`);
                throw new Error(`Error calling ISY: ${JSON.stringify(response)}`);
            }
            else
                return response;
        }
        catch (e) {
            throw new Error(JSON.stringify(e));
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
        try {
            const result = await this.callISY('nodes');
            if (this.debugLogEnabled) {
                fs_1.writeFile('ISYNodesDump.json', JSON.stringify(result), this.logger);
            }
            this.loadFolders(result);
            await this.loadDevices(result);
            this.loadScenes(result);
        }
        catch (e) {
            throw new Error(`Error loading nodes: ${e}`);
        }
        return Promise.resolve();
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
            const newScene = new ISYScene_1.ISYScene(this, scene);
            this.sceneList.set(newScene.address, newScene);
        }
    }
    async loadDevices(obj) {
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
            // let deviceTypeInfo = this.isyTypeToTypeName(device.type, device.address);
            // this.logger(JSON.stringify(deviceTypeInfo));
            const enabled = Boolean(device.enabled);
            const d = DeviceFactory_1.DeviceFactory.createDevice(device);
            if (d.class) {
                newDevice = new d.class(this, device);
                newDevice.productName = d.name;
                newDevice.model = `(${d.modelNumber}) ${d.name} v.${d.version}`;
                newDevice.modelNumber = d.modelNumber;
                newDevice.version = d.version;
            }
            if (enabled) {
                if (newDevice !== null) {
                    try {
                        await newDevice.refreshNotes();
                    }
                    catch (e) {
                        this.logger('No notes found.');
                    }
                    //if (!newDevice.hidden) {
                    this.deviceList.set(newDevice.address, newDevice);
                    //}
                    // this.deviceList.push(newDevice);
                }
                else {
                    this.logger(`Device ${device.name} with type: ${device.type} and nodedef: ${device.nodeDefId} is not specifically supported, returning generic device object. `);
                    newDevice = new ISYDevice_1.ISYDevice(this, device);
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
            const newDevice = new ElkAlarmPanelDevice_1.ElkAlarmSensorDevice(this, name, 1, id, alarmDef === '17'
                ? ISYConstants_1.DeviceTypes.alarmDoorWindowSensor
                : ISYConstants_1.DeviceTypes.coSensor);
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
        if (!this.nodesLoaded) {
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
        try {
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
        catch (e) {
            throw Error(`Error Loading Config: ${e}`);
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
            const newVariable = new ISYVariable_1.ISYVariable(this, id, name, type);
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
    async refreshStatuses() {
        try {
            const that = this;
            const result = await that.callISY('status');
            if (that.debugLogEnabled) {
                fs_1.writeFile('ISYStatusDump.json', JSON.stringify(result), this.logger);
            }
            for (const node of result.nodes.node) {
                this.logger(node);
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
        catch (e) {
            throw new Error('Error refreshing statuses: ' + JSON.stringify(e));
        }
    }
    async initialize(initializeCompleted) {
        const that = this;
        const options = {
            username: this.userName,
            password: this.password
        };
        try {
            await this.loadConfig();
            await this.loadNodes();
            await this.refreshStatuses().then(() => {
                this.loadVariables(ISYConstants_1.VariableType.Integer, () => {
                    this.loadVariables(ISYConstants_1.VariableType.State, () => {
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
                            that.finishInitialize(true, initializeCompleted);
                        }
                    });
                });
            });
        }
        catch (e) {
            this.logger(`Error initializing ISY: ${JSON.stringify(e)}`);
        }
        finally {
            if (this.nodesLoaded !== true)
                this.finishInitialize(true, initializeCompleted);
        }
        return Promise.resolve(true);
    }
    async handleInitializeError(step, reason) {
        this.logger(`Error initializing ISY (${step}): ${JSON.stringify(reason)}`);
        return Promise.reject(reason);
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
                case Families_1.EventType.Elk:
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
                case Families_1.EventType.Trigger:
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
                return this.deviceList[`${address.substr(0, address.length - 1)} 1`];
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
