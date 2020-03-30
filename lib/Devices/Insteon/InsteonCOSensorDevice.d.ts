/// <reference types="node" />
import { ISY } from '../../ISY';
import { InsteonBaseDevice } from './InsteonBaseDevice';
declare const InsteonCOSensorDevice_base: {
    new (...args: any[]): {
        [x: string]: any;
        readonly state: boolean;
        updateState(state: boolean): Promise<any>;
        family: any;
        readonly typeCode: string;
        readonly deviceClass: any;
        readonly parentAddress: any;
        readonly category: number;
        readonly subCategory: number;
        readonly type: any;
        _parentDevice: import("../ISYDevice").ISYDevice<any>;
        readonly children: import("../ISYDevice").ISYDevice<any>[];
        readonly scenes: import("../../ISYScene").ISYScene[];
        readonly formatted: any;
        readonly uom: any;
        readonly pending: any;
        hidden: boolean;
        location: string;
        convertTo(value: any, uom: number): any;
        convertFrom(value: any, uom: number): any;
        addLink(isyScene: import("../../ISYScene").ISYScene): void;
        addChild(childDevice: import("../ISYDevice").ISYDevice<any>): void;
        readonly parentDevice: import("../ISYDevice").ISYDevice<any>;
        refreshProperty(propertyName: string): Promise<any>;
        refreshNotes(): Promise<void>;
        getNotes(): Promise<any>;
        updateProperty(propertyName: string, value: string): Promise<any>;
        sendCommand(command: any, ...parameters: any[]): Promise<any>;
        refresh(): Promise<any>;
        handlePropertyChange(propertyName: string, value: any, formattedValue: string): boolean;
        readonly isy: ISY;
        readonly flag: any;
        readonly nodeDefId: string;
        readonly address: string;
        name: string;
        displayName: string;
        folder: string;
        parent: any;
        parentType: import("../../ISYConstants").NodeType;
        readonly elkId: string;
        nodeType: number;
        propertyChanged: import("events").EventEmitter;
        propsInitialized: boolean;
        logger: (msg: any) => void;
        lastChanged: Date;
        enabled: boolean;
        handleEvent(event: any): boolean;
        onPropertyChanged(propertyName: any, callback: (...args: any[]) => void): void;
    };
} & typeof InsteonBaseDevice;
export declare class InsteonCOSensorDevice extends InsteonCOSensorDevice_base {
    constructor(isy: ISY, deviceNode: {
        type: string;
    });
    get monoxideDetected(): boolean;
}
export {};
