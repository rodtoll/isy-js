/// <reference types="node" />
import * as log4js from '@log4js-node/log4js-api';
import { Categories } from './Categories';
import { EventEmitter } from 'events';
export declare function byteToPct(value: any): number;
export declare function pctToByte(value: any): number;
export declare function byteToDegree(value: any): number;
export declare function getAsync(url: string, options: any): Promise<any>;
export declare enum Family {
    Insteon = 1,
    UPB = 7
}
export interface LoggerLike extends Partial<log4js.Logger> {
    prefix?: string;
    (msg: any): void;
    default(msg: any): void;
}
export interface PropertyChangedEventEmitter extends EventEmitter {
    on(event: 'PropertyChanged', listener: (propertyName: string, newValue: any, oldValue: any, formattedValue: string) => void): this;
}
export declare function parseTypeCode(typeCode: string): {
    category: Categories;
    deviceCode: number;
    firmwareVersion: number;
    minorVersion: number;
};
export declare function getCategory(device: {
    type: string;
}): number;
export declare function getSubcategory(device: {
    type: string;
}): number;
