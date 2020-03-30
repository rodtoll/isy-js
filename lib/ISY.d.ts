import { Client } from 'faye-websocket';
import { Categories } from './Categories';
import { ELKAlarmPanelDevice, ElkAlarmSensorDevice } from './Devices/Elk/ElkAlarmPanelDevice';
import { InsteonBaseDevice } from './Devices/Insteon/InsteonBaseDevice';
import { InsteonOutletDevice, InsteonSwitchDevice } from './Devices/Insteon/InsteonDevice';
import { InsteonDimmableDevice } from './Devices/Insteon/InsteonDimmableDevice';
import { InsteonDimmerSwitchDevice } from './Devices/Insteon/InsteonDimmerSwitchDevice';
import { InsteonDoorWindowSensorDevice } from './Devices/Insteon/InsteonDoorWindowSensorDevice';
import { InsteonFanDevice, InsteonFanMotorDevice } from './Devices/Insteon/InsteonFanDevice';
import { InsteonLockDevice } from './Devices/Insteon/InsteonLockDevice';
import { InsteonMotionSensorDevice } from './Devices/Insteon/InsteonMotionSensorDevice';
import { InsteonRelayDevice } from './Devices/Insteon/InsteonRelayDevice';
import { InsteonThermostatDevice } from './Devices/Insteon/InsteonThermostatDevice';
import { ISYDevice } from './Devices/ISYDevice';
import { Family } from './Families';
import { DeviceTypes, NodeType, Props, States } from './ISYConstants';
import { ISYNode } from './ISYNode';
import { ISYScene } from './ISYScene';
import { ISYVariable } from './ISYVariable';
export { ISYScene, States, Family, DeviceTypes, Categories, Props, ISYVariable, InsteonBaseDevice, InsteonOutletDevice, ISYDevice, InsteonDimmableDevice, InsteonFanDevice, InsteonFanMotorDevice, InsteonLockDevice, InsteonThermostatDevice, InsteonDoorWindowSensorDevice, InsteonSwitchDevice, InsteonDimmerSwitchDevice, InsteonRelayDevice, InsteonMotionSensorDevice, ISYNode, NodeType, ElkAlarmSensorDevice, ELKAlarmPanelDevice };
export declare let Controls: {};
export declare class ISY {
    readonly deviceList: Map<string, ISYDevice<any>>;
    readonly deviceMap: Map<string, string[]>;
    readonly sceneList: Map<string, ISYScene>;
    readonly folderMap: Map<string, string>;
    webSocket: Client;
    zoneMap: Map<string, ElkAlarmSensorDevice>;
    protocol: any;
    address: any;
    restlerOptions: any;
    userName: string;
    password: string;
    credentials: {
        username: string;
        password: string;
    };
    variableList: any[];
    variableIndex: {};
    variableCallback: any;
    nodesLoaded: boolean;
    wsprotocol: string;
    elkEnabled: boolean;
    debugLogEnabled: boolean;
    scenesInDeviceList: any;
    guardianTimer: any;
    elkAlarmPanel: ELKAlarmPanelDevice;
    changeCallback: any;
    log: (msg: any) => void;
    logger: (msg: any) => void;
    lastActivity: any;
    constructor(address: string, username: string, password: string, elkEnabled: boolean, changeCallback: any, useHttps: boolean, scenesInDeviceList: any, enableDebugLogging: any, variableCallback: any, log: (msg: any) => void);
    callISY(url: string): Promise<any>;
    nodeChangedHandler(node: ELKAlarmPanelDevice | ElkAlarmSensorDevice, propertyName?: any): void;
    getElkAlarmPanel(): ELKAlarmPanelDevice;
    loadNodes(): Promise<any>;
    loadFolders(result: {
        nodes: {
            folder: any;
        };
    }): void;
    loadScenes(result: {
        nodes: {
            group: any;
        };
    }): void;
    loadDevices(obj: {
        nodes: {
            node: any;
        };
    }): Promise<void>;
    loadElkNodes(result: any): void;
    loadElkInitialStatus(result: any): void;
    finishInitialize(success: boolean, initializeCompleted: () => void): void;
    guardian(): void;
    variableChangedHandler(variable: {
        id: string;
        type: string;
    }): void;
    checkForFailure(response: any): boolean;
    loadVariables(type: string | number, done: {
        (): void;
        (): void;
        (): void;
        (): void;
    }): void;
    loadConfig(): Promise<void>;
    getVariableList(): any[];
    getVariable(type: any, id: any): any;
    handleISYVariableUpdate(id: any, type: any, value: number, ts: Date): void;
    createVariableKey(type: string, id: string): string;
    createVariables(type: any, result: any): void;
    setVariableValues(result: any): void;
    refreshStatuses(): Promise<void>;
    initialize(initializeCompleted: any): Promise<any>;
    handleInitializeError(step: string, reason: any): Promise<any>;
    handleWebSocketMessage(event: {
        data: any;
    }): void;
    initializeWebSocket(): void;
    getDevice(address: string, parentsOnly?: boolean): ISYDevice<any>;
    getScene(address: string | number): any;
    sendISYCommand(path: string): Promise<any>;
    sendNodeCommand(node: ISYNode, command: string, ...parameters: any[]): Promise<any>;
    sendGetVariable(id: any, type: any, handleResult: (arg0: number, arg1: number) => void): Promise<void>;
    sendSetVariable(id: any, type: any, value: any, handleResult: {
        (success: any): void;
        (arg0: boolean): void;
        (arg0: boolean): void;
    }): Promise<any>;
}
