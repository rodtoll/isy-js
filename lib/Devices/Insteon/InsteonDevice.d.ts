/// <reference types="node" />
import { ISY } from '../../ISY';
import { InsteonRelayDevice } from './InsteonRelayDevice';
export declare const InsteonLampDevice: (InsteonBaseDevice: any) => {
    new (isy: any, node: any): {
        [x: string]: any;
        readonly brightnessLevel: number;
        updateBrightnessLevel(level: number, resultHandler: any): void;
    };
    [x: string]: any;
};
export declare const InsteonSwitchDevice: (InsteonBaseDevice: typeof InsteonRelayDevice) => {
    new (isy: any, node: any): {
        [x: string]: any;
        readonly isOn: boolean;
        updateIsOn(isOn: boolean): Promise<any>;
        readonly state: boolean;
        updateState(state: boolean): Promise<any>;
        readonly typeCode: string;
        readonly deviceClass: any;
        readonly parentAddress: any;
        readonly category: number;
        readonly subCategory: number;
        readonly type: any;
        _parentDevice: import("../ISYDevice").ISYDevice;
        readonly children: import("../ISYDevice").ISYDevice[];
        readonly scenes: import("../../ISYScene").ISYScene[];
        readonly formatted: any;
        readonly uom: any;
        readonly pending: any;
        hidden: boolean;
        location: string;
        convertTo: ((value: any, uom: number) => any) & ((value: any, uom: number) => any);
        convertFrom: ((value: any, uom: number) => any) & ((value: any, uom: number) => any);
        addLink(isyScene: import("../../ISYScene").ISYScene): void;
        addChild(childDevice: import("../ISYDevice").ISYDevice): void;
        readonly parentDevice: import("../ISYDevice").ISYDevice;
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
        family: import("../../Families").Family;
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
        sendBeep(level?: number): Promise<any>;
    };
};
export declare const KeypadDevice: (InsteonBaseDevice: any) => {
    new (isy: any, node: any): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class InsteonOutletDevice extends InsteonRelayDevice {
    constructor(isy: ISY, deviceNode: any);
}
