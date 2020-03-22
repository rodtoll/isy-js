import { Client } from 'faye-websocket';
import { writeFile } from 'fs';
import { get, parsers } from 'restler';
import { Parser } from 'xml2js';
import { parseBooleans, parseNumbers } from 'xml2js/lib/processors';
import { XmlDocument } from 'xmldoc';

import { Categories } from './Categories';
import { DeviceFactory } from './DeviceFactory';
import { ELKAlarmPanelDevice, ElkAlarmSensorDevice } from './Devices/Elk/ElkAlarmPanelDevice';
import { InsteonBaseDevice } from './Devices/Insteon/InsteonBaseDevice';
import { InsteonOutletDevice, InsteonSwitchDevice } from './Devices/Insteon/insteondevice';
import { InsteonDimmableDevice } from './Devices/Insteon/InsteonDimmableDevice';
import { InsteonDimmerSwitchDevice } from './Devices/Insteon/InsteonDimmerSwitchDevice';
import { InsteonDoorWindowSensorDevice } from './Devices/Insteon/InsteonDoorWindowSensorDevice';
import { InsteonFanDevice, InsteonFanMotorDevice } from './Devices/Insteon/InsteonFanDevice';
import { InsteonLeakSensorDevice } from './Devices/Insteon/InsteonLeakSensorDevice';
import { InsteonLockDevice } from './Devices/Insteon/InsteonLockDevice';
import { InsteonMotionSensorDevice } from './Devices/Insteon/InsteonMotionSensorDevice';
import { InsteonRelayDevice } from './Devices/Insteon/InsteonRelayDevice';
import { InsteonThermostatDevice } from './Devices/Insteon/InsteonThermostatDevice';
import { Families } from './Families';
import { DeviceTypes, NodeTypes, Props, States, VariableTypes } from './isyconstants';
import { ISYDevice } from './isydevice';
import { ISYNode } from './isynode';
import * as ProductInfoData from './isyproductinfo.json';
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
	InsteonFanMotorDevice,
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
	public readonly folderMap: Map<string, string> = new Map();

	public webSocket: Client;
	public zoneMap: any;
	public protocol: any;
	public address: any;
	public restlerOptions: any;
	public userName: string;
	public password: string;
	public credentials: { username: string; password: string; };
	public variableList: any[];
	public variableIndex: {};
	public variableCallback: any;
	public nodesLoaded: boolean;
	public wsprotocol: string;
	public elkEnabled: boolean;
	public debugLogEnabled: boolean;
	public scenesInDeviceList: any;
	public guardianTimer: any;
	public elkAlarmPanel: ELKAlarmPanelDevice;
	public changeCallback: any;
	public log: (msg: any) => void;
	public logger: (msg: any) => void;
	public lastActivity: any;
	constructor (
		address: string,
		username: string,
		password: string,
		elkEnabled: boolean,
		changeCallback: any,
		useHttps: boolean,
		scenesInDeviceList: any,
		enableDebugLogging: any,
		variableCallback: any,
		log: (msg: any) => void
	) {
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
				mergeAttrs: true,
				attrValueProcessors: [parseBooleans, parseNumbers],
				valueProcessors: [parseNumbers, parseBooleans]
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
			this.elkAlarmPanel = new ELKAlarmPanelDevice(this, 1, null);
		}
		this.changeCallback = changeCallback;

		log === undefined ? this.log = (msg) => {
			const timeStamp = new Date();
			// tslint:disable-next-line:no-console
			console.log(
				`${timeStamp.getFullYear()}-${timeStamp.getMonth()}-${timeStamp.getDay()}#${timeStamp.getHours()}:${timeStamp.getMinutes()}:${timeStamp.getSeconds()}- ${msg}`
			);
		} : this.log = log;

		this.logger = (msg) => {
			if (
				this.debugLogEnabled ||
				(process.env.ISYJSDEBUG !== undefined &&
					process.env.ISYJSDEBUG !== null)
			) {
				this.log(msg);
			}
			else {
				console.log(msg);
			}
		};
	}



	public async callISY(url: string): Promise<any> {
		url = `${this.protocol}://${this.address}/rest/${url}/`;
		this.logger(`Sending request: ${url}`);
		const p = await getAsync(url, this.restlerOptions).then((response) => {

			if (this.checkForFailure(response)) {
				this.logger(`Error calling ISY: ${JSON.stringify(response)}`);
				return Promise.reject(response);
			}
			return response;
		}, Promise.reject);
		return p;
	}



	public nodeChangedHandler(node: ELKAlarmPanelDevice, propertyName = null) {
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

	public async loadNodes(): Promise<any> {
		try {
			const result = await this.callISY('nodes');
			if (this.debugLogEnabled) {
				writeFile('ISYNodesDump.json', JSON.stringify(result), this.logger);
			}
			this.loadFolders(result);
			this.loadDevices(result);
			this.loadScenes(result);
		}
		catch (e) {
			throw e;
		}
	}

	public loadFolders(result: { nodes: { folder: any; }; }) {

		this.logger('Loading Folders');
		for (const folder of result.nodes.folder) {
			this.logger(`Loading: ${JSON.stringify(folder)}`);
			this.folderMap.set(folder.address, folder.name);

		}
	}

	public loadScenes(result: { nodes: { group: any; }; }) {
		this.logger('Loading Scenes');
		for (const scene of result.nodes.group) {
			if (scene.name === 'ISY' || scene.name === 'Auto DR') {
				continue;
			} // Skip ISY & Auto DR Scenes

			const newScene = new ISYScene(this, scene);
			this.sceneList.set(newScene.address, newScene);
		}
	}

	public loadDevices(obj: { nodes: { node: any; }; }) {
		this.logger('Loading Devices');
		for (const device of obj.nodes.node) {
			if (!this.deviceMap.has(device.pnode)) {
				const address = device.address;
				this.deviceMap[device.pnode] = {
					address
				};
			} else {
				this.deviceMap[device.pnode].push(device.address);
			}
			let newDevice: ISYDevice = null;

			// let deviceTypeInfo = this.isyTypeToTypeName(device.type, device.address);
			// this.logger(JSON.stringify(deviceTypeInfo));

			const enabled = Boolean(device.enabled);
			const d = DeviceFactory.getDeviceDetails(device.family, device.type);

			if (d.class) {
				newDevice = new d.class(this, device);
				newDevice.productName = d.name;
				newDevice.name = `(${d.modelNumber}) ${d.name} v.${d.version}`;
				newDevice.modelNumber = d.modelNumber;
				newDevice.version = d.version;
			}
			if (enabled) {

				if (newDevice !== null) {
					if(!newDevice.hidden)
					{
						this.deviceList.set(newDevice.address,newDevice);
					}


					// this.deviceList.push(newDevice);
				}
				else {
					this.logger(
						`Device ${device.name} with type: ${device.type} and nodedef: ${
						device.nodeDefId
						} is not specifically supported, returning generic device object. `
					);

					newDevice = new ISYDevice(this, device);
				}
			} else {
				this.logger(`Ignoring disabled device: ${device.name}`);
			}
		}

		this.logger(`Devices: ${this.deviceList.entries.length} added.`);
	}

	public loadElkNodes(result: any) {
		const document = new XmlDocument(result);
		const nodes = document
			.childNamed('areas')
			.childNamed('area')
			.childrenNamed('zone');
		for (let index = 0; index < nodes.length; index++) {
			const id = nodes[index].attr.id;
			const name = nodes[index].attr.name;
			const alarmDef = nodes[index].attr.alarmDef;
			const newDevice = new ElkAlarmSensorDevice(
				this,
				name,
				1,
				id,
				alarmDef === 17
					? DeviceTypes.alarmDoorWindowSensor
					: DeviceTypes.coSensor
			);
			this.zoneMap[newDevice.zone] = newDevice;
		}
	}

	public loadElkInitialStatus(result: any) {
		const p = new Parser({
			explicitArray: false,
			mergeAttrs: true
		});
		p.parseString(result, (err: any, res: { ae: any; ze: any; }) => {
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
					if (
						this.deviceList[zoneDevice.address] === null &&
						zoneDevice.isPresent()
					) {
						this.deviceList[zoneDevice.address] = zoneDevice;
						// this.deviceIndex[zoneDevice.address] = zoneDevice;
					}
				}
			}
		});
	}

	public finishInitialize(success: boolean, initializeCompleted: () => void) {
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
			this.logger(
				'Guardian: Detected no activity in more then 60 seconds. Reinitializing web sockets'
			);
			this.initializeWebSocket();
		}
	}

	public variableChangedHandler(variable: { id: string; type: string; }) {
		this.logger(`Variable:${variable.id} (${variable.type}) changed`);
		if (this.variableCallback !== null && this.variableCallback !== undefined) {
			this.variableCallback(this, variable);
		}
	}
	public checkForFailure(response: any) {


		return (
			response === null ||
			response instanceof Error ||
			response.RestResponse !== undefined && response.RestResponse.status !== '200'
		);
	}

	public loadVariables(type: string | number, done: { (): void; (): void; (): void; (): void; }) {
		const that = this;
		const options = {
			username: this.userName,
			password: this.password
		};
		get(
			`${that.protocol}://${that.address}/rest/vars/definitions/${type}`,
			options
		).on('complete', (result: any, response: any) => {
			if (that.checkForFailure(response)) {
				that.logger(
					'Error loading variables from isy. Device likely doesn\'t have any variables defined. Safe to ignore.'
				);
				done();
			} else {
				that.createVariables(type, result);
				get(
					`${that.protocol}://${that.address}/rest/vars/get/${type}`,
					options
				).on('complete', (result: { message: string; }, response: any) => {
					if (that.checkForFailure(response)) {
						that.logger(`Error loading variables from isy: ${result.message}`);
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
		try {
			const result = await this.callISY('config');
			if (this.debugLogEnabled) {
				writeFile('ISYConfigDump.json', JSON.stringify(result), this.logger);
			}

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
		} catch (e) {
			throw Error(e);
		}

	}

	public getVariableList() {
		return this.variableList;
	}
	public getVariable(type: any, id: any) {
		const key = this.createVariableKey(type, id);
		if (
			this.variableIndex[key] !== null &&
			this.variableIndex[key] !== undefined
		) {
			return this.variableIndex[key];
		}
		return null;
	}
	public handleISYVariableUpdate(id: any, type: any, value: number, ts: Date) {
		const variableToUpdate = this.getVariable(type, id);
		if (variableToUpdate !== null) {
			variableToUpdate.value = value;
			variableToUpdate.lastChanged = ts;
			this.variableChangedHandler(variableToUpdate);
		}
	}
	public createVariableKey(type: string, id: string) {
		return type + ':' + id;
	}
	public createVariables(type: any, result: any) {
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
	public setVariableValues(result: any) {
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
					device.logger(
						`Property ${Controls[prop.id].label} (${prop.id}) initialized to: ${
						device[prop.id]
						} (${device.formatted[prop.id]})`
					);
				}
			} else {
				device[node.property.id] = Number(node.property.value);
				device.formatted[node.property.id] = node.property.formatted;
				device.uom[node.property.id] = node.property.uom;
				device.logger(
					`Property ${Controls[node.property.id].label} (${
					node.property.id
					}) initialized to: ${device[node.property.id]} (${
					device.formatted[node.property.id]
					})`
				);
			}
		}
	}

	public initialize(initializeCompleted: any) {
		const that = this;
		const options = {
			username: this.userName,
			password: this.password
		};

		this.loadConfig().then(
			that.loadNodes, (reason) => that.handleInitializeError('Loading Config', reason)).then(
				that.refreshStatuses, (reason) => that.handleInitializeError('Loading Nodes', reason)).then(() => {
					this.loadVariables(VariableTypes.Integer, () => {
						this.loadVariables(VariableTypes.State, () => {
							if (this.elkEnabled) {
								get(
									`${this.protocol}://${that.address}/rest/elk/get/topology`,
									options
								).on('complete', (result: { message: string; }, response: any) => {
									if (that.checkForFailure(response)) {
										that.logger('Error loading from elk: ' + result.message);
										throw new Error(
											'Unable to contact the ELK to get the topology'
										);
									} else {
										that.loadElkNodes(result);
										get(
											`${that.protocol}://${that.address}/rest/elk/get/status`,
											options
										).on('complete', (result: { message: string; }, response: any) => {
											if (that.checkForFailure(response)) {
												that.logger(`Error:${result.message}`);
												throw new Error(
													'Unable to get the status from the elk'
												);
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
				}, (reason) => that.handleInitializeError('Refreshing Statuses', reason)).finally(() => that.finishInitialize(true,initializeCompleted));
	}

	public async handleInitializeError(step: string, reason: any): Promise<any> {
		this.logger(`Error initializing ISY (${step}): ${JSON.stringify(reason)}`);
		return Promise.reject(reason);
	}

	public handleWebSocketMessage(event: { data: any; }) {
		this.lastActivity = new Date();

		parser.parseString(event.data, (err: any, res: { Event: any; }) => {
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
		const auth =
			`Basic ${new Buffer(`${this.userName}:${this.password}`).toString('base64')}`;
		that.logger(
			`Connecting to: ${this.wsprotocol}://${this.address}/rest/subscribe`
		);
		this.webSocket = new Client(
			`${this.wsprotocol}://${this.address}/rest/subscribe`,
			['ISYSUB'],
			{
				headers: {
					Origin: 'com.universal-devices.websockets.isy',
					Authorization: auth
				},
				ping: 10
			}
		);

		this.lastActivity = new Date();

		this.webSocket
			.on('message', (event: any) => {
				that.handleWebSocketMessage(event);
			})
			.on('error', (err: string, response: any) => {
				that.logger(`Websocket subscription error: ${err}`);
				/// throw new Error('Error calling ISY' + err);
			})
			.on('fail', (data: string, response: any) => {
				that.logger(`Websocket subscription failure: ${data}`);
				throw new Error('Failed calling ISY');
			})
			.on('abort', () => {
				that.logger('Websocket subscription aborted.');
				throw new Error('Call to ISY was aborted');
			})
			.on('timeout', (ms: string) => {
				that.logger(
					`Websocket subscription timed out after ${ms} milliseconds.`
				);
				throw new Error('Timeout contacting ISY');
			});
	}

	public getDevice(address: string, parentsOnly = false) {
		let s = this.deviceList.get(address);
		if (!parentsOnly) {
			if (s === null) {
				return this.deviceList[`${address.substr(0, address.length - 1)}1`];
			}
		} else {
			while (
				s.parentAddress !== undefined &&
				s.parentAddress !== s.address &&
				s.parentAddress !== null
			) {
				s = this.deviceList[s.parentAddress];
			}
		}

		return s;
	}

	public getScene(address: string | number) {
		return this.sceneList[address];
	}

	public async sendISYCommand(path: string): Promise<any> {
		// const uriToUse = `${this.protocol}://${this.address}/rest/${path}`;
		this.logger(`Sending command...${path}`);

		return this.callISY(path);
	}

	public async sendNodeCommand(
		node: ISYNode,
		command: string,
		...parameters: any[]
	): Promise<any> {
		let uriToUse = `nodes/${node.address}/cmd/${command}`;
		if (
			parameters !== null &&
			parameters !== undefined &&
			parameters.length > 0
		) {
			uriToUse += `/${parameters.join('/')}`;
		}
		this.logger(`${node.name}: sending ${command} command: ${uriToUse}`);
		return this.callISY(uriToUse);
	}

	public sendGetVariable(id: any, type: any, handleResult: (arg0: number, arg1: number) => void) {
		const uriToUse = `${this.protocol}://${
			this.address
			}/rest/vars/get/${type}/${id}`;
		this.logger(`Sending ISY command...${uriToUse}`);
		const options = {
			username: this.userName,
			password: this.password
		};
		get(uriToUse, options).on('complete', (result: any, response: { statusCode: number; }) => {
			if (response.statusCode === 200) {
				const document = new XmlDocument(result);
				const val = parseInt(document.childNamed('val').val);
				const init = parseInt(document.childNamed('init').val);
				handleResult(val, init);
			}
		});
	}
	public sendSetVariable(id: any, type: any, value: any, handleResult: { (success: any): void; (arg0: boolean): void; (arg0: boolean): void; }) {
		const uriToUse = `${this.protocol}://${
			this.address
			}/rest/vars/set/${type}/${id}/${value}`;
		this.logger(`Sending ISY command...${uriToUse}`);
		const options = {
			username: this.userName,
			password: this.password
		};
		get(uriToUse, options).on('complete', (result: any, response: { statusCode: number; }) => {
			if (response.statusCode === 200) {
				handleResult(true);
			} else {
				handleResult(false);
			}
		});
	}
}
