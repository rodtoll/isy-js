import { Client } from 'faye-websocket';
import { ELKAlarmPanelDevice, ElkAlarmSensorDevice } from './elkdevice';
import { InsteonBaseDevice, InsteonDimmableDevice, InsteonDimmerSwitchDevice, InsteonDoorWindowSensorDevice, InsteonFanDevice, InsteonLockDevice, InsteonMotionSensorDevice, InsteonOutletDevice, InsteonRelayDevice, InsteonSwitchDevice, InsteonThermostatDevice } from './insteondevice';
import { Categories, DeviceTypes, Families, NodeTypes, Props, States } from './isyconstants';
import { ISYDevice } from './isydevice';
import { ISYNode } from './isynode';
import { ISYScene } from './isyscene';
import { ISYVariable } from './isyvariable';
export { ISYScene, States, Families, DeviceTypes, Categories, Props, ISYVariable, InsteonBaseDevice, InsteonOutletDevice, ISYDevice, InsteonDimmableDevice, InsteonFanDevice, InsteonLockDevice, InsteonThermostatDevice, InsteonDoorWindowSensorDevice, InsteonSwitchDevice, InsteonDimmerSwitchDevice, InsteonRelayDevice, InsteonMotionSensorDevice, ISYNode, NodeTypes, ElkAlarmSensorDevice, ELKAlarmPanelDevice };
export declare let Controls: {};
interface ProductInfoEntry {
    type: string;
    address: string;
    name: string;
    deviceType: string;
    connectionType: string;
    batteryOperated: boolean;
}
export declare class ISY {
    readonly deviceList: Map<string, ISYDevice>;
    readonly deviceMap: Map<string, string[]>;
    readonly sceneList: Map<string, ISYScene>;
    readonly folderMap: Map<string, string>;
    productInfoList: Map<string, ProductInfoEntry>;
    webSocket: Client;
    zoneMap: any;
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
    buildDeviceInfoRecord(isyType: any, connectionType: string, deviceType: string): {
        type: any;
        address: string;
        name: string;
        deviceType: string;
        connectionType: string;
        batteryOperated: boolean;
    };
    private isyTypeToTypeName;
    callISY(url: string): Promise<any>;
    private getDeviceTypeBasedOnISYTable;
    nodeChangedHandler(node: ELKAlarmPanelDevice, propertyName?: any): void;
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
    }): void;
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
    getNodeDetail(device: {
        address: any;
    }, callback: (arg0: any) => void): void;
    refreshStatuses(): Promise<void>;
    initialize(initializeCompleted: any): void;
    handleWebSocketMessage(event: {
        data: any;
    }): void;
    initializeWebSocket(): void;
    getDevice(address: string, parentsOnly?: boolean): any;
    getScene(address: string | number): any;
    sendISYCommand(path: string): Promise<any>;
    sendNodeCommand(node: ISYNode, command: string, ...parameters: any[]): Promise<any>;
    sendGetVariable(id: any, type: any, handleResult: (arg0: number, arg1: number) => void): void;
    sendSetVariable(id: any, type: any, value: any, handleResult: {
        (success: any): void;
        (arg0: boolean): void;
        (arg0: boolean): void;
    }): void;
}
