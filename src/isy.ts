import { Client } from 'faye-websocket';
import { writeFile } from 'fs';
import { get, parsers } from 'restler';
import { Parser } from 'xml2js';
import { parseBooleans, parseNumbers } from 'xml2js/lib/processors';
import { XmlDocument } from 'xmldoc';

import { timingSafeEqual } from 'crypto';
import { Categories } from './Categories';
import { DeviceFactory } from './DeviceFactory';
import { ELKAlarmPanelDevice, ElkAlarmSensorDevice } from './Devices/Elk/ElkAlarmPanelDevice';
import { InsteonBaseDevice } from './Devices/Insteon/InsteonBaseDevice';
import { InsteonOutletDevice, InsteonSwitchDevice } from './Devices/Insteon/InsteonDevice';
import { InsteonDimmableDevice } from './Devices/Insteon/InsteonDimmableDevice';
import { InsteonDimmerSwitchDevice } from './Devices/Insteon/InsteonDimmerSwitchDevice';
import { InsteonDoorWindowSensorDevice } from './Devices/Insteon/InsteonDoorWindowSensorDevice';
import { InsteonFanDevice, InsteonFanMotorDevice } from './Devices/Insteon/InsteonFanDevice';
import { InsteonKeypadRelayDevice, InsteonKeypadDimmerDevice } from './Devices/Insteon/InsteonDimmerKeypadDevice';
import { InsteonLeakSensorDevice } from './Devices/Insteon/InsteonLeakSensorDevice';
import { InsteonLockDevice } from './Devices/Insteon/InsteonLockDevice';
import { InsteonMotionSensorDevice } from './Devices/Insteon/InsteonMotionSensorDevice';
import { InsteonRelayDevice } from './Devices/Insteon/InsteonRelayDevice';
import { InsteonThermostatDevice } from './Devices/Insteon/InsteonThermostatDevice';
import { ISYDevice } from './Devices/ISYDevice';
import { EventType, Family } from './Families';
import { DeviceTypes, NodeType, Props, States, VariableType } from './ISYConstants';
import { ISYNode } from './ISYNode';
import * as ProductInfoData from './isyproductinfo.json';
import { ISYScene } from './ISYScene';
import { ISYVariable } from './ISYVariable';
import { getAsync, LoggerLike } from './Utils';
import { InsteonOnOffOutletDevice } from './Devices/Insteon/InsteonOnOffOutletDevice';
import { InsteonSmokeSensorDevice } from './Devices/Insteon/InsteonSmokeSensorDevice';
import { InsteonDimmerOutletDevice } from './Devices/Insteon/InsteonDimmerOutletDevice';
import { InsteonKeypadButtonDevice } from './Devices/Insteon/InsteonKeypadDevice';
import { EventEmitter } from 'events';

export {
	ISYScene,
	States,
	Family,
	VariableType,
	DeviceTypes,
	Categories,
	Props,
	ISYVariable,
	InsteonBaseDevice,
	InsteonOutletDevice,
	ISYDevice,
	InsteonKeypadDimmerDevice,
	InsteonKeypadRelayDevice,
	InsteonKeypadButtonDevice,
	InsteonDimmableDevice,
	InsteonFanDevice,
	InsteonFanMotorDevice,
	InsteonLeakSensorDevice,
	InsteonSmokeSensorDevice,
	InsteonDimmerOutletDevice,
	InsteonOnOffOutletDevice,
	InsteonLockDevice,
	InsteonThermostatDevice,
	InsteonDoorWindowSensorDevice,
	InsteonDimmerSwitchDevice,
	InsteonRelayDevice,
	InsteonMotionSensorDevice,
	ISYNode,
	NodeType,
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

export class ISY extends EventEmitter {
	public readonly deviceList: Map<string, ISYDevice<any>> = new Map();
	public readonly deviceMap: Map<string, string[]> = new Map();
	public readonly sceneList: Map<string, ISYScene> = new Map();
	public readonly folderMap: Map<string, string> = new Map();

	public webSocket: Client;
	public readonly zoneMap: Map<string, ElkAlarmSensorDevice> = new Map();
	public protocol: string;
	public address: string;
	public restlerOptions: any;
	public credentials: { username: string; password: string; };
	public variableList: Map<string, ISYVariable> = new Map();

	public nodesLoaded: boolean = false;
	public wsprotocol: string = 'ws';
	public elkEnabled: boolean;
	public debugLogEnabled: boolean;

	public guardianTimer: any;
	public elkAlarmPanel: ELKAlarmPanelDevice;
	public logger: LoggerLike;
	public lastActivity: any;
	public model: any;
	public serverVersion: any;
	constructor (
		config: { host: string, username: string, password: string, elkEnabled?: boolean, useHttps?: boolean, debugLogEnabled?: boolean; }, logger: LoggerLike) {
		super();
		this.address = config.host;
		this.logger = logger;
		this.credentials = {
			username: config.username,
			password: config.password
		};

		this.restlerOptions = {
			username: this.credentials.username,
			password: this.credentials.password,
			parser: parsers.xml,
			xml2js: {
				explicitArray: false,
				mergeAttrs: true,
				attrValueProcessors: [parseBooleans, parseNumbers],
				valueProcessors: [parseNumbers, parseBooleans]
			}
		};

		this.nodesLoaded = false;
		this.protocol = config.useHttps === true ? 'https' : 'http';
		this.wsprotocol = 'ws';
		this.elkEnabled = config.elkEnabled ?? false;

		this.debugLogEnabled =
			config.debugLogEnabled ?? false;

		this.guardianTimer = null;
		if (this.elkEnabled) {
			this.elkAlarmPanel = new ELKAlarmPanelDevice(this, 1);
		}

	}

	public emit(event: 'InitializeCompleted' | 'NodeAdded' | 'NodeRemoved' | 'NodeChanged', node?: ISYNode): boolean {
		return super.emit(event, node);
	}



	public on(event: 'InitializeCompleted' | 'NodeAdded' | 'NodeRemoved' | 'NodeChanged', listener: (node?: ISYNode) => void): this {
		return super.on(event, listener);
	}

	public async callISY(url: string): Promise<any> {
		url = `${this.protocol}://${this.address}/rest/${url}/`;
		this.logger(`Sending request: ${url}`);
		try {
			const response = await getAsync(url, this.restlerOptions);

			if (this.checkForFailure(response)) {
				// this.logger(`Error calling ISY: ${JSON.stringify(response)}`);
				throw new Error(`Error calling ISY: ${JSON.stringify(response)}`);
			} else {
				return response;
			}
		} catch (e) {
			throw new Error(JSON.stringify(e));
		}

	}

	public nodeChangedHandler(node: ELKAlarmPanelDevice | ElkAlarmSensorDevice, propertyName = null) {
		const that = this;
		if (this.nodesLoaded) {
			// this.logger(`Node: ${node.address} changed`);
			// if (this.changeCallback !== undefined && this.changeCallback !== null) {
			// t//his.changeCallback(that, node, propertyName);
			// }
		}
	}

	public getElkAlarmPanel() {
		return this.elkAlarmPanel;
	}

	public async loadNodes(): Promise<any> {
		try {
			const result = await this.callISY('nodes');
			if (this.debugLogEnabled) { } {
				writeFile('ISYNodesDump.json', JSON.stringify(result), this.logger);
			}
			this.loadFolders(result);
			await this.loadDevices(result);
			this.loadScenes(result);
		} catch (e) {

			throw new Error(`Error loading nodes: ${e}`);
		}
		return Promise.resolve();
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

	public async loadDevices(obj: { nodes: { node: any; }; }) {
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
			let newDevice: ISYDevice<any> = null;

			// let deviceTypeInfo = this.isyTypeToTypeName(device.type, device.address);
			// this.logger(JSON.stringify(deviceTypeInfo));

			const enabled = Boolean(device.enabled);
			const d = DeviceFactory.createDevice(device);

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

					} catch (e) {
						this.logger('No notes found.');
					}
					// if (!newDevice.hidden) {
					this.deviceList.set(newDevice.address, newDevice);
					// }

					// this.deviceList.push(newDevice);
				} else {
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

		this.logger(`Devices: ${this.deviceList.size} added.`);
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
				id /*TODO: Handle CO Sensor vs. Door/Window Sensor */
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

	}

	public checkForFailure(response: any): boolean {

		return (
			response === null ||
			response instanceof Error ||
			response.RestResponse !== undefined && response.RestResponse.status !== '200'
		);
	}

	public async loadVariables(type: VariableType): Promise<any> {
		const that = this;
		return this.callISY(`vars/definitions/${type}`).then((result) => that.createVariables(type, result))
			.then(() => that.callISY(`vars/get/${type}`)).then(that.setVariableValues.bind(that));
	}

	public async loadConfig() {
		try {
			const result = await this.callISY('config');
			if (this.debugLogEnabled) {
				writeFile('ISYConfigDump.json', JSON.stringify(result), this.logger);
			}

			const controls = result.configuration.controls;
			this.model = result.configuration.deviceSpecs.model;
			this.serverVersion = result.configuration.app_version;
			// TODO: Check Installed Features
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
			throw Error(`Error Loading Config: ${e}`);
		}

	}

	public getVariableList() {
		return this.variableList;
	}
	public getVariable(type: VariableType, id: number): ISYVariable {
		const key = this.createVariableKey(type, id);
		if (
			this.variableList.has(key)
		) {
			return this.variableList[key];
		}
		return null;
	}

	public createVariableKey(type: VariableType, id: number) {
		return `${type}:${id}`;
	}
	public createVariables(type: VariableType, result: any) {
		for (const variable of result.CList.e) {
			const id = Number(variable.id);
			const name = variable.name;
			const newVariable = new ISYVariable(this, id, name, type);
			this.variableList.set(this.createVariableKey(type, id), newVariable);

		}
	}
	public setVariableValues(result: any) {

		for (const vals of result.vars.var) {
			const type = Number(vals.type) as VariableType;
			const id = Number(vals.id);
			const variable = this.getVariable(type, id);
			if (variable) {
				variable.init = vals.init;
				variable.value = vals.val;
				variable.lastChanged = new Date(vals.ts);
			}
		}
	}

	public async refreshStatuses() {
		try {
			const that = this;
			const result = await that.callISY('status');
			if (that.debugLogEnabled) {
				writeFile('ISYStatusDump.json', JSON.stringify(result), this.logger);
			}
			for (const node of result.nodes.node) {
				this.logger(node);
				const device = that.getDevice(node.id);
				if (Array.isArray(node.property)) {
					for (const prop of node.property) {
						device[prop.id] = device.convertFrom(Number(prop.value), Number(prop.uom));
						device.formatted[prop.id] = prop.formatted;
						device.uom[prop.id] = prop.uom;
						device.logger(
							`Property ${Controls[prop.id].label} (${prop.id}) initialized to: ${
							device[prop.id]
							} (${device.formatted[prop.id]})`
						);
					}
				} else {
					device[node.property.id] = device.convertFrom(
						Number(node.property.value),
						Number(node.property.uom)
					);
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
		} catch (e) {
			throw new Error(`Error refreshing statuses: ${JSON.stringify(e)}`);
		}
	}

	public async initialize(initializeCompleted: any): Promise<any> {
		const that = this;
		const options = {
			username: this.credentials.username,
			password: this.credentials.password
		};
		try {
			await this.loadConfig();
			await this.loadNodes();
			await this.loadVariables(VariableType.Integer);
			await this.loadVariables(VariableType.State);
			await this.refreshStatuses().then(() => {
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
		} catch (e) {
			this.logger(`Error initializing ISY: ${JSON.stringify(e)}`);

		} finally {
			if (this.nodesLoaded !== true) {
				this.finishInitialize(true, initializeCompleted);
			}
		}
		return Promise.resolve(true);

	}

	public async  handleInitializeError(step: string, reason: any): Promise<any> {
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
			const stringControl = (evt.control as string)?.replace('_', '');
			switch (stringControl) {
				case EventType.Elk.toString():
					if (actionValue === 2) {

						this.elkAlarmPanel.handleEvent(event);

					} else if (actionValue === 3) {
						const zeElement = evt.eventInfo.ze;
						const zoneId = zeElement.zone;
						const zoneDevice = this.zoneMap[zoneId];
						if (zoneDevice !== null) {
							if (zoneDevice.handleEvent(event)) {
								this.nodeChangedHandler(zoneDevice);
							}
						}
					}

					break;

				case EventType.Trigger.toString():
					if (actionValue === 6) {
						const varNode = evt.eventInfo.var;
						const id = varNode.id;
						const type = varNode.type;
						this.getVariable(type, id)?.handleEvent(evt);
					}
					break;
				case EventType.Heartbeat.toString():

					this.logger(`Received ${EventType[Number(stringControl)]} Signal from ISY: ${JSON.stringify(evt)}`);
					break;

				default:
					if (evt.node !== '' && evt.node !== undefined && evt.node !== null) {
						//
						const impactedDevice = this.getDevice(evt.node);
						if (impactedDevice !== undefined && impactedDevice !== null) {
							impactedDevice.handleEvent(evt);
						} else {
							this.logger(EventType[Number(stringControl)] + ' Event for Unidentified Device: ' + JSON.stringify(evt));
						}
					} else {
						this.logger(`Unhandled ${EventType[Number(stringControl)]} Event: ${JSON.stringify(evt)}`);
					}

					break;
			}
		});
	}

	public initializeWebSocket() {
		const that = this;
		const auth =
			`Basic ${new Buffer(`${this.credentials.username}:${this.credentials.password}`).toString('base64')}`;
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

	public getDevice(address: string, parentsOnly = false): ISYDevice<any> {
		let s = this.deviceList.get(address);
		if (!parentsOnly) {
			if (s === null) {
				return this.deviceList[`${address.substr(0, address.length - 1)} 1`];
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

	public async  sendISYCommand(path: string): Promise<any> {
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

	public async sendGetVariable(id: any, type: any, handleResult: (arg0: number, arg1: number) => void) {
		const uriToUse = `${this.protocol}://${
			this.address
			}/rest/vars/get/${type}/${id}`;
		this.logger(`Sending ISY command...${uriToUse}`);

		return this.callISY(uriToUse).then((p) => handleResult(p.val, p.init));
	}
	public async sendSetVariable(id: any, type: any, value: any, handleResult: { (success: any): void; (arg0: boolean): void; (arg0: boolean): void; }) {
		const uriToUse = `/rest/vars/set/${type}/${id}/${value}`;
		this.logger(`Sending ISY command...${uriToUse}`);

		return this.callISY(uriToUse);
	}
}
