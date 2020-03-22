/// <reference types="node" />
import { RequestOptions } from 'https';
export declare function byteToPct(value: any): number;
export declare function pctToByte(value: any): number;
export declare function byteToDegree(value: any): number;
export declare function getAsync(url: string, options: RequestOptions): Promise<any>;
export declare enum Family {
    Insteon = 1,
    UPB = 7
}
export declare function getCategory(device: any): number;
export declare function getSubcategory(device: any): number;
