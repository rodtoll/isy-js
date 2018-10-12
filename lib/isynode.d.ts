/// <reference types="node" />
import { ISY } from './isy';
import { EventEmitter } from 'events';
export declare class ISYNode {
    readonly isy: ISY;
    readonly flag: any;
    readonly nodeDefId: string;
    readonly address: string;
    [x: string]: any;
    name: string;
    family: any;
    parent: any;
    readonly elkId: string;
    nodeType: number;
    propertyChanged: EventEmitter;
    propsInitialized: boolean;
    logger: (msg: any) => void;
    lastChanged: Date;
    enabled: boolean;
    constructor(isy: ISY, node: any);
    handlePropertyChange(propertyName: any, value: any, formattedValue: any): boolean;
    handleEvent(event: any): boolean;
    onPropertyChanged(propertyName: any, callback: any): void;
}
