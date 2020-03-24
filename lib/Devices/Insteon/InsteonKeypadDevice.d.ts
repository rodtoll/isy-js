import { ISY } from '../../ISY';
declare const InsteonKeypadDevice_base: {
    new (isy: any, node: any): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class InsteonKeypadDevice extends InsteonKeypadDevice_base {
    constructor(isy: ISY, deviceNode: any);
}
export {};
