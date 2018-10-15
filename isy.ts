import { Client } from 'faye-websocket';
import { get, parsers } from 'restler';
import { Parser } from 'xml2js';
import { XmlDocument } from 'xmldoc';
import {
	InsteonBaseDevice,
	InsteonDimmableDevice,
	InsteonDimmerSwitchDevice,
	InsteonDoorWindowSensorDevice,
	InsteonFanDevice,
	InsteonLockDevice,
	InsteonMotionSensorDevice,
	InsteonOutletDevice,
	InsteonRelayDevice,
	InsteonRelaySwitchDevice,
	InsteonSwitchDevice,
	InsteonThermostatDevice
} from './insteondevice';

import { Categories, DeviceTypes, Families, NodeTypes, Props, States, VariableTypes } from './isyconstants';
import { ISYDevice } from './isydevice';
import { ISYNode } from './isynode';
import * as ProductInfoData from './isyproductinfo.json';

import { stringify } from 'querystring';
import { isNullOrUndefined } from 'util';
import { ELKAlarmPanelDevice, ElkAlarmSensorDevice } from './elkdevice';
import { ISYScene } from './isyscene';
import { ISYVariable } from './isyvariable';
import { getAsync } from './utils';

export {
	ISYScene,
	States,
	Families,
	DeviceTypes,
	Categories,
	Props,
	ISYVariable,
	InsteonBaseDevice,
	InsteonOutletDevice,
	ISYDevice,
	InsteonDimmableDevice,
	InsteonFanDevice,
	InsteonLockDevice,
	InsteonThermostatDevice,
	InsteonDoorWindowSensorDevice,
	InsteonSwitchDevice,
	InsteonDimmerSwitchDevice,
	InsteonRelayDevice,
	InsteonMotionSensorDevice,
	ISYNode,
	NodeTypes,
	ElkAlarmSensorDevice,
	ELKAlarmPanelDevice
};

const parser = new Parser({
	explicitArray: false,
	mergeAttrs: true
});

export let Controls = {};

const ProductInfo: ProductInfoEntry[] = ProductInfoData;

interface ProductInfoEntry {
	type: string;
	address: string;
	name: string;
	deviceType: string;
	connectionType: string;
	batteryOperated: boolean;
}
export class ISY {
	public readonly deviceList: Map<string, ISYDevice> = new Map();
	public readonly deviceMap: Map<string, string[]> = new Map();
	public readonly sceneList: Map<string, ISYScene> = new Map();
	public productInfoList: Map<string, ProductInfoEntry> = new Map();
	public webSocket: Client;
	public zoneMap: any;
	public protocol: any;
	public address: any;
	public restlerOptions: any;
	public userName: any;
	public password: any;
	public credentials: { username: string; password: string };
	public variableList: any[];
	public variableIndex: {};
	public variableCallback: any;
	public nodesLoaded: boolean;
	public wsprotocol: string;
	public elkEnabled: any;
	public debugLogEnabled: any;
	public scenesInDeviceList: any;
	public guardianTimer: any;
	public elkAlarmPanel: ELKAlarmPanelDevice;
	public changeCallback: any;
	public log: (msg: any) => void;
	public logger: (msg: any) => void;
	public lastActivity: any;
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
			parser: parsers.xml,
			xml2js: {
				explicitArray: false,
				mergeAttrs: true
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

		this.debugLogEnabled = enableDebugLogging === undefined ? false : enableDebugLogging;
		this.scenesInDeviceList = scenesInDeviceList === undefined ? false : scenesInDeviceList;
		this.guardianTimer = null;

		if (this.elkEnabled) {
			this.elkAlarmPanel = new ELKAlarmPanelDevice(this, 1);
		}
		this.changeCallback = changeCallback;
		if (log === undefined) {
			this.log = (msg) => {
				const timeStamp = new Date();
				console.log(`${timeStamp.getFullYear()}-${timeStamp.getMonth()}-${timeStamp.getDay()}#${timeStamp.getHours()}:${timeStamp.getMinutes()}:${timeStamp.getSeconds()}- ${msg}`);
			};
		} else {
			this.log = log;
		}
		this.logger = (msg) => {
			if (this.debugLogEnabled || (process.env.ISYJSDEBUG !== undefined && process.env.ISYJSDEBUG !== null)) {
				this.log(msg);
			}
		};
		for (const p of ProductInfo) {
			this.logger(p);
			if (p.address !== '' && p.address !== undefined && p.address !== null) {
				this.productInfoList.set(p.type + ' ' + String(p.address), p);
			} else {
				this.productInfoList.set(p.type, p);
			}

		}

		this.logger(JSON.stringify(this.productInfoList.size));
	}

	public buildDeviceInfoRecord(isyType, connectionType, deviceType) {
		return {
			type: isyType,
			address: '',
			name: 'Generic Device',
			deviceType,
			connectionType,
			batteryOperated: false
		};
	}

	private isyTypeToTypeName(isyType: string, address: string): ProductInfoEntry {
		if (this.productInfoList.has(isyType)) {

			const t = this.productInfoList.get(isyType);
			this.logger(JSON.stringify(t));
			return t;
		} else {
			this.logger(JSON.stringify(isyType));
			return this.productInfoList.get(isyType + ' ' + address.split(' ')[3]);
		}
		return null;
	}

	public async callISY(url): Promise<any> {
		url = `${this.protocol}://${this.address}/rest/${url}/`;
		this.logger(`Sending request: ${url}`);
		return getAsync(url, this.restlerOptions);
	}

	private getDeviceTypeBasedOnISYTable(deviceNode) {
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
		this.logger(JSON.stringify(deviceNode));
		// ZWave nodes identify themselves with devtype node
		if (deviceNode.devtype !== null && deviceNode.devtype !== undefined) {
			if (deviceNode.devtype.cat !== null) {
				subType = Number(deviceNode.devtype.cat);
			}
		}
		// Insteon Device Family
		if (familyId === Families.Insteon) {
			// Dimmable Devices
			if (mainType === Categories.DimmableControl) {
				// Special case fanlinc has a fan element
				if (subType === 46 && subAddress === 2) {
					return this.buildDeviceInfoRecord(isyType, 'Insteon', DeviceTypes.fan);
				} else {
					return this.buildDeviceInfoRecord(isyType, 'Insteon', DeviceTypes.dimmableLight);
				}
			} else if (mainType === Categories.RelayControl) {
				// Special case appliance Lincs into outlets
				if (subType in [6, 7, 12, 23]) {
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
			} else if (mainType === Categories.SensorActuator) {
				// I/O Lincs
				if (subType === 0) {
					if (subAddress === 1) {
						return this.buildDeviceInfoRecord(isyType, 'Insteon', DeviceTypes.doorWindowSensor);
					} else {
						return this.buildDeviceInfoRecord(isyType, 'Insteon', 'outlet');
					}
					// Other sensors. Not yet supported
				}
				// Access controls/doors/locks
			} else if (mainType === Categories.AccessControl) {
				// MorningLinc
				if (subType === 6) {
					if (subAddress === 1) {
						return this.buildDeviceInfoRecord(isyType, 'Insteon', 'lock');
						// Ignore subdevice which operates opposite for the locks
					} else {
						return null;
					}
					// Other devices, going to guess they are similar to MorningLinc
				}
			} else if (mainType === Categories.SecurityHealthSafety) {
				// Motion sensors
				if (subType === 1 || subType === 3) {
					if (subAddress === 1) {
						return this.buildDeviceInfoRecord(isyType, 'Insteon', DeviceTypes.motionSensor);
						// Ignore battery level sensor and daylight sensor
					}
				} else if (subType === 2 || subType === 9 || subType === 17) {
					return this.buildDeviceInfoRecord(isyType, 'Insteon', DeviceTypes.doorWindowSensor);
					// Smoke, leak sensors, don't yet know how to support
				}
				// No idea how to test or support
			} else if (mainType === Categories.ClimateControl) {
				// Thermostats
				return this.buildDeviceInfoRecord(isyType, 'Insteon', DeviceTypes.thermostat);
			} else if (mainType === 6) {
				// Leak Sensors
				return this.buildDeviceInfoRecord(isyType, 'Insteon', DeviceTypes.leakSensor);
			} else if (mainType === Categories.Controller) {
				if (subType === 6 || subType === 8) {
					// Insteon Remote
					return this.buildDeviceInfoRecord(isyType, 'Insteon', DeviceTypes.remote);
				}
			}
			// Z-Wave Device Family
		} else if (familyId === Families.ZWave) {
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
		} else if (familyId === Families.Poly) {
			// Node Server Node
			if (mainType === 1 && subType === 1) {
				// Node Server Devices are reported as 1.1.0.0.
				return this.buildDeviceInfoRecord(isyType, 'NodeServer', DeviceTypes.polyNode);
			}
			return this.buildDeviceInfoRecord(isyType, 'Unknown', DeviceTypes.unknown);
		}
	}

	public nodeChangedHandler(node, propertyName = null) {
		const that = this;
		if (this.nodesLoaded) {
			// this.logger(`Node: ${node.address} changed`);
			if (this.changeCallback !== undefined && this.changeCallback !== null) {
				this.changeCallback(that, node, propertyName);
			}
		}
	}

	public getElkAlarmPanel() {
		return this.elkAlarmPanel;
	}

	public loadNodes() {
		return this.callISY('nodes').then((result) => {
			this.loadDevices(result);
			this.loadScenes(result);
		});
	}

	public loadScenes(result) {
		for (const scene of result.nodes.group) {
			if (scene.name === 'ISY' || scene.name === 'Auto DR') {
				continue;
			} // Skip ISY & Auto DR Scenes

			const newScene = new ISYScene(this, scene);
			this.sceneList.set(newScene.address, newScene);
		}
	}

	public loadDevices(obj) {
		for (const device of obj.nodes.node) {
			if (!this.deviceMap.has(device.pnode)) {
				const address = device.address;
				this.deviceMap[device.pnode] = {
					address
				};
			} else {
				this.deviceMap[device.pnode].push(device.address);
			}
			let newDevice = null;
			let deviceTypeInfo = this.isyTypeToTypeName(device.type, device.address);
		// this.logger(JSON.stringify(deviceTypeInfo));

			const enabled = device.enabled;
			if (enabled !== 'false') {
				// Try fallback to new generic device identification when not specifically identified.
				if (deviceTypeInfo === null || deviceTypeInfo === undefined) {
					deviceTypeInfo = this.getDeviceTypeBasedOnISYTable(device);
				}
				if (deviceTypeInfo !== null && deviceTypeInfo !== undefined) {
					if (deviceTypeInfo.deviceType === DeviceTypes.light) {
						newDevice = new InsteonRelayDevice(this, device, deviceTypeInfo);
					} else if (deviceTypeInfo.deviceType === DeviceTypes.dimmableLight) {
						newDevice = new InsteonDimmableDevice(this, device, deviceTypeInfo);
					} else if (deviceTypeInfo.deviceType === DeviceTypes.doorWindowSensor) {
						newDevice = new InsteonDoorWindowSensorDevice(this, device, deviceTypeInfo);
					} else if (deviceTypeInfo.deviceType === DeviceTypes.motionSensor) {
						newDevice = new InsteonMotionSensorDevice(this, device, deviceTypeInfo);
					} else if (deviceTypeInfo.deviceType === DeviceTypes.fan) {
						newDevice = new InsteonFanDevice(this, device, deviceTypeInfo);
					} else if (deviceTypeInfo.deviceType === DeviceTypes.lock || deviceTypeInfo.deviceType === DeviceTypes.secureLock) {
						newDevice = new InsteonLockDevice(this, device, deviceTypeInfo);
					} else if (deviceTypeInfo.deviceType === DeviceTypes.outlet) {
						newDevice = new InsteonOutletDevice(this, device, deviceTypeInfo);
					} else if (deviceTypeInfo.deviceType === DeviceTypes.thermostat) {
						newDevice = new InsteonThermostatDevice(this, device, deviceTypeInfo);
					}

					this.logger(`Device ${newDevice.name} added as ${newDevice.constructor.name}.`);

					// Support the device with a base device object
				} else {
					this.logger(`Device ${device.name} with type: ${device.type} and nodedef: ${device.nodeDefId} is not specifically supported, returning generic device object. `);
					newDevice = new ISYDevice(this, device);
				}
				if (newDevice !== null) {
					this.deviceList.set(newDevice.address, newDevice);

					// this.deviceList.push(newDevice);
				}
			} else {
				this.logger(`Ignoring disabled device: ${device.name}`);
			}
		}

		this.logger('Devices: ' + this.deviceList.entries.length);
	}

	public loadElkNodes(result) {
		const document = new XmlDocument(result);
		const nodes = document
			.childNamed('areas')
			.childNamed('area')
			.childrenNamed('zone');
		for (let index = 0; index < nodes.length; index++) {
			const id = nodes[index].attr.id;
			const name = nodes[index].attr.name;
			const alarmDef = nodes[index].attr.alarmDef;
			const newDevice = new ElkAlarmSensorDevice(this, name, 1, id, alarmDef === 17 ? DeviceTypes.alarmDoorWindowSensor : DeviceTypes.coSensor);
			this.zoneMap[newDevice.zone] = newDevice;
		}
	}

	public loadElkInitialStatus(result) {
		const p = new Parser({
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
					if (this.deviceList[zoneDevice.address] === null && zoneDevice.isPresent()) {
						this.deviceList[zoneDevice.address] = zoneDevice;
						// this.deviceIndex[zoneDevice.address] = zoneDevice;
					}
				}
			}
		});
	}

	public finishInitialize(success, initializeCompleted) {
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

	public guardian() {
		const timeNow = new Date();

		if (Number(timeNow) - Number(this.lastActivity) > 60000) {
			this.logger('Guardian: Detected no activity in more then 60 seconds. Reinitializing web sockets');
			this.initializeWebSocket();
		}
	}

	public variableChangedHandler(variable) {
		this.logger('Variable:' + variable.id + ' (' + variable.type + ') changed');
		if (this.variableCallback !== null && this.variableCallback !== undefined) {
			this.variableCallback(this, variable);
		}
	}
	public checkForFailure(response) {
		return response === null || response instanceof Error || response.statusCode !== 200;
	}
	public loadVariables(type, done) {
		const that = this;
		const options = {
			username: this.userName,
			password: this.password
		};
		get(that.protocol + '://' + that.address + '/rest/vars/definitions/' + type, options).on('complete', (result, response) => {
			if (that.checkForFailure(response)) {
				that.logger('Error loading variables from isy. Device likely doesn\'t have any variables defined. Safe to ignore.');
				done();
			} else {
				that.createVariables(type, result);
				get(that.protocol + '://' + that.address + '/rest/vars/get/' + type, options).on('complete', (result, response) => {
					if (that.checkForFailure(response)) {
						that.logger('Error loading variables from isy: ' + result.message);
						throw new Error('Unable to load variables from the ISY');
					} else {
						that.setVariableValues(result);
					}
					done();
				});
			}
		});
	}

	public async loadConfig() {
		const result = await this.callISY('config');
		const controls = result.configuration.controls;
		// this.logger(result.configuration);
		if (controls !== undefined) {
			// this.logger(controls.control);
			// var arr = new Array(controls.control);
			for (const ctl of controls.control) {
				// this.logger(ctl);
				Controls[ctl.name] = ctl;
			}
		}
	}

	public getVariableList() {
		return this.variableList;
	}
	public getVariable(type, id) {
		const key = this.createVariableKey(type, id);
		if (this.variableIndex[key] !== null && this.variableIndex[key] !== undefined) {
			return this.variableIndex[key];
		}
		return null;
	}
	public handleISYVariableUpdate(id, type, value, ts) {
		const variableToUpdate = this.getVariable(type, id);
		if (variableToUpdate !== null) {
			variableToUpdate.value = value;
			variableToUpdate.lastChanged = ts;
			this.variableChangedHandler(variableToUpdate);
		}
	}
	public createVariableKey(type, id) {
		return type + ':' + id;
	}
	public createVariables(type, result) {
		const document = new XmlDocument(result);
		const variables = document.childrenNamed('e');
		for (let index = 0; index < variables.length; index++) {
			const id = variables[index].attr.id;
			const name = variables[index].attr.name;
			const newVariable = new ISYVariable(this, id, name, type);
			this.variableList.push(newVariable);
			this.variableIndex[this.createVariableKey(type, id)] = newVariable;
		}
	}
	public setVariableValues(result) {
		const document = new XmlDocument(result);
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

	public getNodeDetail(device, callback) {

		get(`${this.protocol}://${this.address}/rest/nodes/${device.address}/`, this.restlerOptions)
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

	public async refreshStatuses() {
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
					device.logger(`Property ${Controls[prop.id].label} (${prop.id}) initialized to: ${device[prop.id]} (${device.formatted[prop.id]})`);
				}
			} else {
				device[node.property.id] = Number(node.property.value);
				device.formatted[node.property.id] = node.property.formatted;
				device.uom[node.property.id] = node.property.uom;
				device.logger(`Property ${Controls[node.property.id].label} (${node.property.id}) initialized to: ${device[node.property.id]} (${device.formatted[node.property.id]})`);
			}
		}
	}

	public initialize(initializeCompleted) {
		const that = this;
		const options = {
			username: this.userName,
			password: this.password
		};

		this.loadConfig()
			.then(this.loadNodes.bind(this))
			.then(() =>
				this.refreshStatuses().then(() => {
					this.loadVariables(VariableTypes.Integer, () => {
						this.loadVariables(VariableTypes.State, () => {
							if (this.elkEnabled) {
								get(`${this.protocol}://${that.address}/rest/elk/get/topology`, options).on('complete', (result, response) => {
									if (that.checkForFailure(response)) {
										that.logger('Error loading from elk: ' + result.message);
										throw new Error('Unable to contact the ELK to get the topology');
									} else {
										that.loadElkNodes(result);
										get(that.protocol + '://' + that.address + '/rest/elk/get/status', options).on('complete', (result, response) => {
											if (that.checkForFailure(response)) {
												that.logger('Error:' + result.message);
												throw new Error('Unable to get the status from the elk');
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
				})
			)
			.catch((reason) => this.logger('Error calling ISY: ' + reason));
	}

	public handleWebSocketMessage(event) {
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
			} else if (evt.action instanceof Number || evt.action instanceof String) {
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
					} else if (actionValue === 3) {
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
						} else {
							this.logger(JSON.stringify(evt));
						}
					}
					break;
			}
		});
	}

	public initializeWebSocket() {
		const that = this;
		const auth = 'Basic ' + new Buffer(this.userName + ':' + this.password).toString('base64');
		that.logger('Connecting to: ' + this.wsprotocol + '://' + this.address + '/rest/subscribe');
		this.webSocket = new Client(`${this.wsprotocol}://${this.address}/rest/subscribe`, ['ISYSUB'], {
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
				that.logger('Websocket subscription error: ' + err);
				/// throw new Error('Error calling ISY' + err);
			})
			.on('fail', (data, response) => {
				that.logger('Websocket subscription failure: ' + data);
				throw new Error('Failed calling ISY');
			})
			.on('abort', () => {
				that.logger('Websocket subscription aborted.');
				throw new Error('Call to ISY was aborted');
			})
			.on('timeout', (ms) => {
				that.logger('Websocket subscription timed out after ' + ms + ' milliseconds.');
				throw new Error('Timeout contacting ISY');
			});
	}

	public getDevice(address: string, parentsOnly = false) {
		let s = this.deviceList.get(address);
		if (!parentsOnly) {
			if (s === null) {
				return this.deviceList[address.substr(0, address.length - 1) + '1'];
			}
		} else {
			while (s.parentAddress !== undefined && s.parentAddress !== s.address && s.parentAddress !== null) {
				s = this.deviceList[s.parentAddress];
			}
		}

		return s;
	}

	public getScene(address) {
		return this.sceneList[address];
	}

	public async sendISYCommand(path): Promise<any> {
		// const uriToUse = `${this.protocol}://${this.address}/rest/${path}`;
		this.logger('Sending command...' + path);

		return this.callISY(path);
	}

	public async sendNodeCommand(node: ISYNode, command: String, ...parameters: any[]): Promise<any> {
		let uriToUse = `nodes/${node.address}/cmd/${command}`;
		if (parameters !== null && parameters !== undefined && parameters.length > 0) {
			uriToUse += `/${parameters.join('/')}`;
		}
		this.logger(`${node.name}: sending ${command} command: ${uriToUse}`);
		return this.callISY(uriToUse);
	}

	public sendGetVariable(id, type, handleResult) {
		const uriToUse = `${this.protocol}://${this.address}/rest/vars/get/${type}/${id}`;
		this.logger(`Sending ISY command...${uriToUse}`);
		const options = {
			username: this.userName,
			password: this.password
		};
		get(uriToUse, options).on('complete', (result, response) => {
			if (response.statusCode === 200) {
				const document = new XmlDocument(result);
				const val = parseInt(document.childNamed('val').val);
				const init = parseInt(document.childNamed('init').val);
				handleResult(val, init);
			}
		});
	}
	public sendSetVariable(id, type, value, handleResult) {
		const uriToUse = `${this.protocol}://${this.address}/rest/vars/set/${type}/${id}/${value}`;
		this.logger(`Sending ISY command...${uriToUse}`);
		const options = {
			username: this.userName,
			password: this.password
		};
		get(uriToUse, options).on('complete', (result, response) => {
			if (response.statusCode === 200) {
				handleResult(true);
			} else {
				handleResult(false);
			}
		});
	}
}
