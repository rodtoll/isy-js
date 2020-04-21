/// <reference types="node" />
import { Client } from 'faye-websocket';
import { Categories } from './Categories';
import { ELKAlarmPanelDevice, ElkAlarmSensorDevice } from './Devices/Elk/ElkAlarmPanelDevice';
import { InsteonBaseDevice } from './Devices/Insteon/InsteonBaseDevice';
import { InsteonOutletDevice } from './Devices/Insteon/InsteonDevice';
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
import { Family } from './Families';
import { DeviceTypes, NodeType, Props, States, VariableType } from './ISYConstants';
import { ISYNode } from './ISYNode';
import { ISYScene } from './ISYScene';
import { ISYVariable } from './ISYVariable';
import { LoggerLike } from './Utils';
import { InsteonOnOffOutletDevice } from './Devices/Insteon/InsteonOnOffOutletDevice';
import { InsteonSmokeSensorDevice } from './Devices/Insteon/InsteonSmokeSensorDevice';
import { InsteonDimmerOutletDevice } from './Devices/Insteon/InsteonDimmerOutletDevice';
import { InsteonKeypadButtonDevice } from './Devices/Insteon/InsteonKeypadDevice';
import { EventEmitter } from 'events';
export { ISYScene, States, Family, VariableType, DeviceTypes, Categories, Props, ISYVariable, InsteonBaseDevice, InsteonOutletDevice, ISYDevice, InsteonKeypadDimmerDevice, InsteonKeypadRelayDevice, InsteonKeypadButtonDevice, InsteonDimmableDevice, InsteonFanDevice, InsteonFanMotorDevice, InsteonLeakSensorDevice, InsteonSmokeSensorDevice, InsteonDimmerOutletDevice, InsteonOnOffOutletDevice, InsteonLockDevice, InsteonThermostatDevice, InsteonDoorWindowSensorDevice, InsteonDimmerSwitchDevice, InsteonRelayDevice, InsteonMotionSensorDevice, ISYNode, NodeType, ElkAlarmSensorDevice, ELKAlarmPanelDevice };
export declare let Controls: {};
export declare class ISY extends EventEmitter {
    readonly deviceList: Map<string, ISYDevice<any>>;
    readonly deviceMap: Map<string, string[]>;
    readonly sceneList: Map<string, ISYScene>;
    readonly folderMap: Map<string, string>;
    webSocket: Client;
    readonly zoneMap: Map<string, ElkAlarmSensorDevice>;
    protocol: string;
    address: string;
    restlerOptions: any;
    credentials: {
        username: string;
        password: string;
    };
    variableList: Map<string, ISYVariable>;
    nodesLoaded: boolean;
    wsprotocol: string;
    elkEnabled: boolean;
    debugLogEnabled: boolean;
    guardianTimer: any;
    elkAlarmPanel: ELKAlarmPanelDevice;
    logger: LoggerLike;
    lastActivity: any;
    model: any;
    serverVersion: any;
    constructor(config: {
        host: string;
        username: string;
        password: string;
        elkEnabled?: boolean;
        useHttps?: boolean;
        debugLogEnabled?: boolean;
    }, logger: LoggerLike);
    emit(event: 'InitializeCompleted' | 'NodeAdded' | 'NodeRemoved' | 'NodeChanged', node?: ISYNode): boolean;
    on(event: 'InitializeCompleted' | 'NodeAdded' | 'NodeRemoved' | 'NodeChanged', listener: (node?: ISYNode) => void): this;
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
    loadVariables(type: VariableType): Promise<any>;
    loadConfig(): Promise<void>;
    getVariableList(): Map<string, ISYVariable>;
    getVariable(type: VariableType, id: number): ISYVariable;
    createVariableKey(type: VariableType, id: number): string;
    createVariables(type: VariableType, result: any): void;
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
